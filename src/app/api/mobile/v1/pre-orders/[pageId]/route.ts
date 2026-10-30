import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import { preOrderActiveBody } from "@/contracts/mobile/preorders";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { deleteOwnerPreOrderPage, setOwnerPreOrderPageActive } from "@/lib/pre-order-pages/service";
import { preOrderDetailResponse } from "@/lib/mobile/preorder-detail-response";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/pre-orders/[pageId]">;
const notFoundOr400 = (error: string) => mobileError(error === "Pre-order page not found." ? 404 : 400, error);

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { pageId } = await ctx.params;
    return await preOrderDetailResponse(guard.value.owner, pageId);
  } catch (error) {
    return mobileServerError("Mobile pre-order page failed", error);
  }
}

/** Take a page off the shop or put it back. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, preOrderActiveBody);
  if (!body.ok) return body.response;
  try {
    const { pageId } = await ctx.params;
    const result = await setOwnerPreOrderPageActive(guard.value.owner.id, pageId, body.data.isActive);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile pre-order toggle failed", error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { pageId } = await ctx.params;
    const result = await deleteOwnerPreOrderPage(guard.value.owner.id, pageId);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile pre-order delete failed", error);
  }
}
