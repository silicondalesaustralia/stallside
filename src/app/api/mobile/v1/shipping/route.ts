import { saveShippingBody, shippingQuery, type ShippingResponse } from "@/contracts/mobile/shipping";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import {
  getOwnerShippingSettings,
  saveOwnerFulfilmentDefault,
  saveOwnerShippingRates,
} from "@/lib/shipping/settings";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

async function settingsResponse(ownerId: string, standId: string) {
  const current = await getOwnerShippingSettings(ownerId, standId);
  if (!current) return mobileError(404, "Business not found.");
  return mobileJson<ShippingResponse>(current);
}

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, shippingQuery);
  if (!query.ok) return query.response;
  try {
    return await settingsResponse(guard.value.owner.id, query.data.standId);
  } catch (error) {
    return mobileServerError("Mobile shipping failed", error);
  }
}

/** Saves pickup/shipping default and rates together; returns what was saved. */
export async function PUT(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, saveShippingBody);
  if (!body.ok) return body.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, body.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const { settings } = body.data;
    const rates = await saveOwnerShippingRates(ownerId, stand.value.id, settings);
    if ("error" in rates) return mobileError(400, rates.error);
    const fulfilment = await saveOwnerFulfilmentDefault(ownerId, stand.value.id, settings.fulfilmentDefault);
    if ("error" in fulfilment) return mobileError(400, fulfilment.error);
    return await settingsResponse(ownerId, stand.value.id);
  } catch (error) {
    return mobileServerError("Mobile shipping save failed", error);
  }
}
