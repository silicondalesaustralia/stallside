import { taxSettingsBody } from "@/contracts/mobile/tax";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadTaxSettingsResponse } from "@/lib/mobile/tax-dto";
import { updateOwnerTaxSettings } from "@/lib/tax/owner-tax-settings";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** GST / VAT / sales tax settings for all the owner's businesses. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    return mobileJson(await loadTaxSettingsResponse(guard.value.owner.id));
  } catch (error) {
    return mobileServerError("Mobile tax settings failed", error);
  }
}

/** Saves tax settings, same rules as the web Tax page; returns the updated settings. */
export async function PUT(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, taxSettingsBody);
  if (!body.ok) return body.response;
  try {
    const ownerId = guard.value.owner.id;
    const result = await updateOwnerTaxSettings(ownerId, body.data);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson(await loadTaxSettingsResponse(ownerId));
  } catch (error) {
    return mobileServerError("Mobile tax settings update failed", error);
  }
}
