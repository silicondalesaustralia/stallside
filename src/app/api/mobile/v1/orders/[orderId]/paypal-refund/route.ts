import type { NextRequest } from "next/server";
import type { OrderPaymentMessage } from "@/contracts/mobile/order-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { checkOwnerPayPalRefund } from "@/lib/refunds/owner-refunds";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Reads refunds made in PayPal back onto the order. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/orders/[orderId]/paypal-refund">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { orderId } = await ctx.params;
    const result = await checkOwnerPayPalRefund(guard.value.owner.id, orderId);
    return mobileJson<OrderPaymentMessage>(result);
  } catch (error) {
    return mobileServerError("Mobile PayPal refund check failed", error);
  }
}
