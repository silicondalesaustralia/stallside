import type { NextRequest } from "next/server";
import type { ShipOrderResponse } from "@/contracts/mobile/order-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { deliverOwnerOrder } from "@/lib/orders/shipping";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Same as the web "Mark delivered & email customer" button. */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/orders/[orderId]/deliver">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { orderId } = await ctx.params;
    const result = await deliverOwnerOrder(guard.value.owner.id, orderId);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<ShipOrderResponse>({ message: result.ok });
  } catch (error) {
    return mobileServerError("Mobile deliver order failed", error);
  }
}
