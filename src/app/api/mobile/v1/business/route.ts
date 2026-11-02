import { businessDetailsBody, businessQuery } from "@/contracts/mobile/business";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadBusinessDetails } from "@/lib/mobile/business-dto";
import { updateOwnerStandDetails } from "@/lib/stand/stand-details";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

/** One business's Details tab. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, businessQuery);
  if (!query.ok) return query.response;
  try {
    const details = await loadBusinessDetails(guard.value.owner.id, query.data.standId);
    if (!details) return mobileError(404, "Business not found.");
    return mobileJson(details);
  } catch (error) {
    return mobileServerError("Mobile business details failed", error);
  }
}

/** Saves name, location, currency and timezone, same as "Save details" on the web. */
export async function PUT(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, businessDetailsBody);
  if (!body.ok) return body.response;
  try {
    const ownerId = guard.value.owner.id;
    const { standId, ...input } = body.data;
    const result = await updateOwnerStandDetails(ownerId, standId, input);
    if ("error" in result) return mobileError(400, result.error);
    const details = await loadBusinessDetails(ownerId, standId);
    if (!details) return mobileError(404, "Business not found.");
    return mobileJson(details);
  } catch (error) {
    return mobileServerError("Mobile business details update failed", error);
  }
}
