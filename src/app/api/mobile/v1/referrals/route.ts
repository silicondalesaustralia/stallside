import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadReferralsResponse } from "@/lib/mobile/referrals-dto";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

/** The owner's referral link, earnings and referred businesses. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    return mobileJson(await loadReferralsResponse(guard.value.owner.id));
  } catch (error) {
    return mobileServerError("Mobile referrals failed", error);
  }
}
