import {
  createUpsellBody,
  upsellsQuery,
  type UpsellSaveResponse,
  type UpsellsResponse,
} from "@/contracts/mobile/upsells";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { listOwnerUpsellRows } from "@/lib/upsells/load";
import { defaultUpsellLabel, firstOrderDiscountLabel, loadUpsellOverview } from "@/lib/upsells/overview";
import { saveOwnerUpsell } from "@/lib/upsells/save";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, upsellsQuery);
  if (!query.ok) return query.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const [upsells, overview] = await Promise.all([
      listOwnerUpsellRows(ownerId, stand.value.id),
      loadUpsellOverview(ownerId, stand.value.id),
    ]);
    if (!overview) return mobileError(404, "Business not found.");
    return mobileJson<UpsellsResponse>({
      upsells,
      defaultUpsell: defaultUpsellLabel(overview),
      firstOrderDiscount: firstOrderDiscountLabel(overview),
      productOverrides: overview.productOverrides,
      preOrderAddOns: overview.preOrderAddOns,
    });
  } catch (error) {
    return mobileServerError("Mobile upsells failed", error);
  }
}

/** New upsell for the business, validated like the web form. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, createUpsellBody);
  if (!body.ok) return body.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, body.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const result = await saveOwnerUpsell(ownerId, null, body.data.input, stand.value.id);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<UpsellSaveResponse>({ id: result.id }, 201);
  } catch (error) {
    return mobileServerError("Mobile upsell create failed", error);
  }
}
