import { businessSocialBody } from "@/contracts/mobile/business";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadBusinessDetails } from "@/lib/mobile/business-dto";
import { updateOwnerStandSocial } from "@/lib/stand/stand-details";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Saves the business social links, same as "Save social links" on the web. */
export async function PUT(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, businessSocialBody);
  if (!body.ok) return body.response;
  try {
    const ownerId = guard.value.owner.id;
    const { standId, ...links } = body.data;
    const result = await updateOwnerStandSocial(ownerId, standId, links);
    if ("error" in result) return mobileError(400, result.error);
    const details = await loadBusinessDetails(ownerId, standId);
    if (!details) return mobileError(404, "Business not found.");
    return mobileJson(details);
  } catch (error) {
    return mobileServerError("Mobile business social links update failed", error);
  }
}
