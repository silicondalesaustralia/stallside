import type { PublicProductCard } from "@/lib/public-product";
import {
  addToStandCart,
  productQtyInCart,
  readStandCartLines,
  type CartLine,
} from "@/lib/stand-cart-storage";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";

function cartConflictMessage(
  product: PublicProductCard,
  other: PublicProductCard,
): string | null {
  if (Boolean(other.isPreOrder) !== Boolean(product.isPreOrder)) {
    return CART_MIX_TAKE_NOW_PREORDER;
  }
  if (
    product.isPreOrder &&
    other.isPreOrder &&
    other.collectionAtMs !== product.collectionAtMs
  ) {
    return CART_MIX_COLLECTION_DAYS;
  }
  return null;
}

/** Validate and add selected pre-order quantities to the stand cart. */
export function addPreOrderSelections(input: {
  standSlug: string;
  picks: PublicProductCard[];
  qtys: Record<string, number>;
  catalogProducts: PublicProductCard[];
}): { ok: true } | { ok: false; error: string } {
  const lines = readStandCartLines(input.standSlug);
  for (const product of input.picks) {
    for (const line of lines) {
      if (line.productId === product.id) continue;
      const other = input.catalogProducts.find((p) => p.id === line.productId);
      if (!other) continue;
      const msg = cartConflictMessage(product, other);
      if (msg) return { ok: false, error: msg };
    }
    const addQty = input.qtys[product.id] ?? 0;
    const remaining =
      product.stockQuantity - productQtyInCart(lines, product.id);
    if (addQty > remaining) {
      return { ok: false, error: `Not enough left of ${product.name}.` };
    }
  }

  for (const product of input.picks) {
    const addQty = input.qtys[product.id] ?? 0;
    if (product.hasOptions) continue;
    addToStandCart(
      input.standSlug,
      product.id,
      addQty,
      product.stockQuantity,
      [],
    );
  }
  return { ok: true };
}

export function remainingForProduct(
  standSlug: string,
  product: PublicProductCard,
  lines?: CartLine[],
): number {
  const cart = lines ?? readStandCartLines(standSlug);
  return product.stockQuantity - productQtyInCart(cart, product.id);
}
