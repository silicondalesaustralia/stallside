import { socialQuery } from "@/contracts/mobile/social";
import { socialKitEnabledFor } from "@/lib/beta-features";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadSocialResponse } from "@/lib/mobile/social-dto";
import { mobileError, mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** Scheduled, draft and recent social posts for one business (Social kit owners only). */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const { owner, user } = guard.value;
  if (!socialKitEnabledFor(owner, user.email)) return mobileError(403, "Social isn't on for your account yet.");
  const query = readMobileQuery(request, socialQuery);
  if (!query.ok) return query.response;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;
  try {
    return mobileJson(await loadSocialResponse(stand.value.id));
  } catch (error) {
    return mobileServerError("Mobile social posts failed", error);
  }
}
