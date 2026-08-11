import type { PublicProductCard } from "@/lib/public-product";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";

export type CartUpsellOffer = {
  productId: string;
  name: string;
  priceCents: number;
  /** List price when discounted; show struck through. */
  compareAtCents?: number | null;
  stockQuantity: number;
};

export type StandPreOrderUpsell = CartUpsellOffer | null;

/** Pre-order page add-on keyed to the products on that page. */
export type PagePreOrderUpsell = CartUpsellOffer & {
  pageProductIds: string[];
};

function preOrderOfferFromTrigger(
  trigger: PublicProductCard,
  offer: PublicProductCard,
): CartUpsellOffer {
  const list =
    trigger.preOrderUpsellPriceCents != null
      ? trigger.preOrderUpsellPriceCents
      : offer.priceCents;
  const priced = resolveAddonPricing(
    list,
    trigger.preOrderUpsellDiscountKind,
    trigger.preOrderUpsellDiscountValue,
  );
  return {
    productId: offer.id,
    name: trigger.preOrderUpsellName!,
    priceCents: priced.saleCents,
    compareAtCents: priced.compareAtCents,
    stockQuantity: offer.stockQuantity,
  };
}

/** Page-level wins for pre-order carts; then product-level; then stand fallback. */
export function resolveCartUpsell(input: {
  cartLines: { productId: string; asUpsell?: boolean }[];
  products: PublicProductCard[];
  standUpsell: CartUpsellOffer | null;
  pagePreOrderUpsells?: PagePreOrderUpsell[];
  standPreOrderUpsell: StandPreOrderUpsell;
}): CartUpsellOffer | null {
  const byId = new Map(input.products.map((p) => [p.id, p]));
  const nonUpsell = input.cartLines.filter((l) => !l.asUpsell);
  if (nonUpsell.length === 0) return null;

  const cartIsPreOrder = nonUpsell.every(
    (l) => byId.get(l.productId)?.isPreOrder,
  );

  if (cartIsPreOrder) {
    const cartIds = nonUpsell.map((l) => l.productId);
    for (const pageOffer of input.pagePreOrderUpsells ?? []) {
      if (!cartIds.every((id) => pageOffer.pageProductIds.includes(id))) {
        continue;
      }
      if (pageOffer.stockQuantity <= 0) continue;
      if (input.cartLines.some((l) => l.productId === pageOffer.productId)) {
        continue;
      }
      return {
        productId: pageOffer.productId,
        name: pageOffer.name,
        priceCents: pageOffer.priceCents,
        compareAtCents: pageOffer.compareAtCents,
        stockQuantity: pageOffer.stockQuantity,
      };
    }
    for (const line of nonUpsell) {
      const trigger = byId.get(line.productId);
      if (!trigger?.preOrderUpsellProductId || !trigger.preOrderUpsellName) {
        continue;
      }
      const offer = byId.get(trigger.preOrderUpsellProductId);
      if (!offer || offer.stockQuantity <= 0) continue;
      if (input.cartLines.some((l) => l.productId === offer.id)) continue;
      return preOrderOfferFromTrigger(trigger, offer);
    }
    if (
      input.standPreOrderUpsell &&
      input.standPreOrderUpsell.stockQuantity > 0 &&
      !input.cartLines.some(
        (l) => l.productId === input.standPreOrderUpsell!.productId,
      )
    ) {
      return input.standPreOrderUpsell;
    }
    return null;
  }

  for (const line of nonUpsell) {
    const trigger = byId.get(line.productId);
    if (!trigger?.upsellProductId) continue;
    const offer = byId.get(trigger.upsellProductId);
    if (!offer || offer.stockQuantity <= 0) continue;
    if (input.cartLines.some((l) => l.productId === offer.id)) continue;
    return {
      productId: offer.id,
      name: offer.name,
      priceCents:
        trigger.upsellPriceCents != null
          ? trigger.upsellPriceCents
          : offer.priceCents,
      stockQuantity: offer.stockQuantity,
    };
  }
  if (!input.standUpsell || input.standUpsell.stockQuantity <= 0) return null;
  if (input.cartLines.some((l) => l.productId === input.standUpsell!.productId)) {
    return null;
  }
  return input.standUpsell;
}
