import type { NextRequest } from "next/server";
import { refundOrderBody, type OrderPaymentMessage } from "@/contracts/mobile/order-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { refundOwnerCardOrder } from "@/lib/refunds/owner-refunds";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Stripe or Square refund back to the customer's card, same as the web order page. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/orders/[orderId]/refund">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, refundOrderBody);
  if (!body.ok) return body.response;

  try {
    const { orderId } = await ctx.params;
    const result = await refundOwnerCardOrder({ ownerId: guard.value.owner.id, orderId, ...body.data });
    if (!result.ok) return mobileError(400, result.message);
    return mobileJson<OrderPaymentMessage>({ message: result.message });
  } catch (error) {
    return mobileServerError("Mobile order refund failed", error);
  }
}
