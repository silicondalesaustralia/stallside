import type { MobileProductDetail, ProductStatus } from "@/contracts/mobile/product-detail";
import type { OwnerProductDetail } from "@/lib/products/detail";
import { parsePriceTiers } from "@/lib/price-tiers";
import { productImageList } from "@/lib/product-images";
import { variantLabel } from "@/lib/product-variants/variant-title";

function statusOf(product: OwnerProductDetail): ProductStatus {
  if (product.isArchived) return "draft";
  return product.isHidden ? "hidden" : "live";
}

export function toMobileProductDetail(product: OwnerProductDetail): MobileProductDetail {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    photos: productImageList(product.imageUrl, product.galleryImageUrls),
    standName: product.stand.name,
    status: statusOf(product),
    priceCents: product.priceCents,
    compareAtPriceCents: product.compareAtPriceCents,
    costCents: product.costCents,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    sku: product.sku,
    upc: product.upc,
    isPreOrder: product.preOrderEligible,
    hasOptions: product._count.optionGroups > 0,
    hasVolumePrices: parsePriceTiers(product.priceTiers).length > 0,
    supplierName: product.member?.name ?? null,
    variants: product.variants.map((v) => ({
      id: v.id,
      label: variantLabel(v),
      sku: v.sku,
      priceCents: v.priceCents,
      stockQuantity: v.stockQuantity,
      isActive: v.isActive,
    })),
    webPath: `/dashboard/products/${product.id}`,
  };
}
