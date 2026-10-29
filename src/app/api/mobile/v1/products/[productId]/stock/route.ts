import type { NextRequest } from "next/server";
import { stockUpdateBody, type StockUpdateResponse } from "@/contracts/mobile/products";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { saveStockCounts } from "@/lib/inventory/save-stock-counts";
import { findOwnerProduct } from "@/lib/products/list";
import { productHasVariants } from "@/lib/product-variants/has-variants";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Same path as the web inventory stock count: logs the change, alerts on low stock, syncs Square. */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/products/[productId]/stock">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, stockUpdateBody);
  if (!body.ok) return body.response;

  try {
    const { productId } = await ctx.params;
    const product = await findOwnerProduct(guard.value.owner.id, productId);
    if (!product) return mobileError(404, "Product not found.");
    if (await productHasVariants(product.id)) {
      return mobileError(409, "This product has variants. Open the product to change stock per variant.");
    }

    await saveStockCounts({
      ownerId: guard.value.owner.id,
      counts: new Map([[product.id, body.data.quantity]]),
      reason: "Stock count (app)",
      standId: product.standId,
    });
    return mobileJson<StockUpdateResponse>({ productId, stockQuantity: body.data.quantity });
  } catch (error) {
    return mobileServerError("Mobile stock update failed", error);
  }
}
