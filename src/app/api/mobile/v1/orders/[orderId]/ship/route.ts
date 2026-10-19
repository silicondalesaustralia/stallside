import type { NextRequest } from "next/server";
import { shipOrderBody, type ShipOrderResponse } from "@/contracts/mobile/order-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { shipOwnerOrder } from "@/lib/orders/shipping";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Same as the web "Save & email customer" shipping form. */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/orders/[orderId]/ship">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, shipOrderBody);
  if (!body.ok) return body.response;

  try {
    const { orderId } = await ctx.params;
    const result = await shipOwnerOrder(guard.value.owner.id, orderId, body.data);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<ShipOrderResponse>({ message: result.ok });
  } catch (error) {
    return mobileServerError("Mobile ship order failed", error);
  }
}
