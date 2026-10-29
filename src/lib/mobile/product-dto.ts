import type { MobileProduct } from "@/contracts/mobile/products";
import type { StandProductRow } from "@/lib/products/list";

export function toMobileProduct(product: StandProductRow, variantCount = 0): MobileProduct {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    priceCents: product.priceCents,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    isArchived: product.isArchived,
    supplierName: product.member?.name ?? null,
    variantCount,
  };
}
