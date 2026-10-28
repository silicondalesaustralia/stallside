import type { VariantOptionNames, VariantOptionValues } from "./variant-title";

export type CartVariant = VariantOptionValues & {
  id: string;
  priceCents: number;
  stockQuantity: number;
};

type ProductWithVariants = VariantOptionNames & { variants: CartVariant[] };

/** The variant a cart line refers to, or an error when it is missing or wrong. */
export function resolveCartVariant(
  product: ProductWithVariants,
  variantId: string | null,
): { variant: CartVariant | null } | { error: string } {
  if (product.variants.length === 0) {
    return variantId ? { error: "One or more product options are invalid." } : { variant: null };
  }
  if (!variantId) return { error: "Choose an option for each product." };
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return { error: "One or more product options are unavailable." };
  return { variant };
}

/** True when the cart asks for more of any variant than is in stock. */
export function variantStockShort(
  items: { productId: string; variantId: string | null; quantity: number }[],
  byId: Map<string, ProductWithVariants>,
): boolean {
  const qty = new Map<string, number>();
  for (const item of items) {
    if (!item.variantId) continue;
    qty.set(item.variantId, (qty.get(item.variantId) ?? 0) + item.quantity);
  }
  for (const item of items) {
    if (!item.variantId) continue;
    const variant = byId.get(item.productId)?.variants.find((v) => v.id === item.variantId);
    if (!variant || variant.stockQuantity < (qty.get(item.variantId) ?? 0)) return true;
  }
  return false;
}
