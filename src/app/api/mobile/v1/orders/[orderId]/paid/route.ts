import type { NextRequest } from "next/server";
import type { MobileOrderDetail } from "@/contracts/mobile/order-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { markOwnerOrderPaid } from "@/lib/orders/mark-paid";
import { getOwnerOrder } from "@/lib/orders/detail";
import { toMobileOrderDetail } from "@/lib/mobile/order-detail-dto";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Cash or PayID money has arrived; returns the updated order. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/orders/[orderId]/paid">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { orderId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await markOwnerOrderPaid(ownerId, orderId);
    if ("error" in result) return mobileError(400, result.error);
    const order = await getOwnerOrder(ownerId, orderId);
    if (!order) return mobileError(404, "Order not found.");
    return mobileJson<MobileOrderDetail>(toMobileOrderDetail(order));
  } catch (error) {
    return mobileServerError("Mobile mark order paid failed", error);
  }
}
