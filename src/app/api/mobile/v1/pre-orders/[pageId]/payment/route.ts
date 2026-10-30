import type { NextRequest } from "next/server";
import { preOrderPaymentBody } from "@/contracts/mobile/preorders";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { setOwnerPreOrderPayOptions } from "@/lib/pre-order-pages/pay-options";
import { preOrderDetailResponse } from "@/lib/mobile/preorder-detail-response";
import { mobileError, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** How shoppers can pay on the page; returns the updated page. */
export async function PUT(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/pre-orders/[pageId]/payment">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, preOrderPaymentBody);
  if (!body.ok) return body.response;
  try {
    const { pageId } = await ctx.params;
    const { owner } = guard.value;
    const result = await setOwnerPreOrderPayOptions(owner, pageId, body.data);
    if ("error" in result) {
      return mobileError(result.error === "Pre-order page not found." ? 404 : 400, result.error);
    }
    return await preOrderDetailResponse(owner, pageId);
  } catch (error) {
    return mobileServerError("Mobile pre-order payment update failed", error);
  }
}
