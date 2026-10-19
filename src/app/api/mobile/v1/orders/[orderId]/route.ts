import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import type { MobileOrderDetail } from "@/contracts/mobile/order-detail";
import { deleteOwnerOrder } from "@/lib/orders/service";
import { getOwnerOrder } from "@/lib/orders/detail";
import { toMobileOrderDetail } from "@/lib/mobile/order-detail-dto";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/orders/[orderId]">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { orderId } = await ctx.params;
    const order = await getOwnerOrder(guard.value.owner.id, orderId);
    if (!order) return mobileError(404, "Order not found.");
    return mobileJson<MobileOrderDetail>(toMobileOrderDetail(order));
  } catch (error) {
    return mobileServerError("Mobile order detail failed", error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/orders/[orderId]">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { orderId } = await ctx.params;
    const result = await deleteOwnerOrder(guard.value.owner.id, orderId);
    if ("error" in result) return mobileError(404, result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile order delete failed", error);
  }
}
