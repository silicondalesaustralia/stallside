import {
  createDiscountBody,
  discountsQuery,
  type DiscountSaveResponse,
  type DiscountsResponse,
} from "@/contracts/mobile/discounts";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadStandDiscountRows } from "@/lib/discounts/load";
import { saveOwnerDiscount } from "@/lib/discounts/save";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, discountsQuery);
  if (!query.ok) return query.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const discounts = await loadStandDiscountRows(ownerId, stand.value.id);
    return mobileJson<DiscountsResponse>({ discounts });
  } catch (error) {
    return mobileServerError("Mobile discounts failed", error);
  }
}

/** New discount code for the business, validated like the web form. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, createDiscountBody);
  if (!body.ok) return body.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, body.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const result = await saveOwnerDiscount(ownerId, null, body.data.input, stand.value.id);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<DiscountSaveResponse>({ id: result.id }, 201);
  } catch (error) {
    return mobileServerError("Mobile discount create failed", error);
  }
}
