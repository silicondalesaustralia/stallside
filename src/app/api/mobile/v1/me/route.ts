import type { MeResponse } from "@/contracts/mobile/me";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { buildMobileFeatures } from "@/lib/mobile/features";
import { listOwnerBusinesses } from "@/lib/selected-business";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { MOBILE_MIN_APP_VERSION, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Who is signed in, their businesses, and which dashboard sections the app should show. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const { user, owner } = guard.value;

  try {
    const businesses = await listOwnerBusinesses(owner.id);
    return mobileJson<MeResponse>({
      user: { id: user.id, email: user.email, name: user.name },
      owner: {
        id: owner.id,
        businessName: owner.businessName,
        plan: owner.subscriptionPlan,
        proAccess: ownerHasProAccess(owner, { email: user.email, role: user.role }),
        onboardingComplete: owner.onboardingCompletedAt !== null,
      },
      businesses,
      features: buildMobileFeatures(),
      minAppVersion: MOBILE_MIN_APP_VERSION,
    });
  } catch (error) {
    return mobileServerError("Mobile me failed", error);
  }
}
