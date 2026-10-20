import { communicationAudience, type AudienceCountResponse } from "@/contracts/mobile/communication";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { countOwnerAudience } from "@/lib/communication/audience";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** How many people a message would go to, for the "Send to N people?" check. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, communicationAudience);
  if (!body.ok) return body.response;
  try {
    const result = await countOwnerAudience(guard.value.owner.id, body.data);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<AudienceCountResponse>({ count: result.count });
  } catch (error) {
    return mobileServerError("Mobile audience count failed", error);
  }
}
