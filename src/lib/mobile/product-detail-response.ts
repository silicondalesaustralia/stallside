import type { MobileProductDetail } from "@/contracts/mobile/product-detail";
import { getOwnerProductDetail } from "@/lib/products/detail";
import { toMobileProductDetail } from "@/lib/mobile/product-detail-dto";
import { mobileError, mobileJson } from "@/lib/mobile/http";

const NOT_FOUND = "Product not found.";

/** The product as the app shows it, or 404. */
export async function productDetailResponse(ownerId: string, productId: string) {
  const product = await getOwnerProductDetail(ownerId, productId);
  if (!product) return mobileError(404, NOT_FOUND);
  return mobileJson<MobileProductDetail>(toMobileProductDetail(product));
}

/** Turns a shared product service result into the updated product or an error response. */
export async function afterProductChange(ownerId: string, productId: string, result: { ok: true } | { error: string }) {
  if ("error" in result) return mobileError(result.error === NOT_FOUND ? 404 : 400, result.error);
  return productDetailResponse(ownerId, productId);
}
