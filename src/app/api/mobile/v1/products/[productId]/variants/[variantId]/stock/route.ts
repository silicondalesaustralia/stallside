import type { NextRequest } from "next/server";
import { stockUpdateBody } from "@/contracts/mobile/products";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { setOwnerVariantStock } from "@/lib/product-variants/set-variant-stock";
import { afterProductChange } from "@/lib/mobile/product-detail-response";
import { mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** One variant's stock; returns the updated product with its new total. */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/products/[productId]/variants/[variantId]/stock">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, stockUpdateBody);
  if (!body.ok) return body.response;

  try {
    const { productId, variantId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await setOwnerVariantStock(ownerId, productId, variantId, body.data.quantity);
    return await afterProductChange(ownerId, productId, result);
  } catch (error) {
    return mobileServerError("Mobile variant stock update failed", error);
  }
}
