import type { NextRequest } from "next/server";
import { productPriceBody } from "@/contracts/mobile/product-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { updateOwnerProductPrice } from "@/lib/products/lifecycle";
import { afterProductChange, productDetailResponse } from "@/lib/mobile/product-detail-response";
import { mobileServerError, readMobileBody } from "@/lib/mobile/http";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/products/[productId]">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { productId } = await ctx.params;
    return await productDetailResponse(guard.value.owner.id, productId);
  } catch (error) {
    return mobileServerError("Mobile product detail failed", error);
  }
}

/** Price and "Was" price. */
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/products/[productId]">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, productPriceBody);
  if (!body.ok) return body.response;

  try {
    const { productId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await updateOwnerProductPrice(ownerId, productId, body.data);
    return await afterProductChange(ownerId, productId, result);
  } catch (error) {
    return mobileServerError("Mobile product price update failed", error);
  }
}
