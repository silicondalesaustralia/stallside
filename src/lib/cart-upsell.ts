import type { PublicProductCard } from "@/lib/public-product";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";
import { pickTakeNowUpsell, type UpsellRule } from "@/lib/upsells/rules";

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

type UpsellTriggerProduct = {
  id: string;
  priceCents: number;
  isPreOrder: boolean;
  upsellProductId?: string | null;
  upsellPriceCents?: number | null;
};

/** Price for an upsell line that came from an Upsell rule, else null (older settings price it). */
export function ruleUpsellUnitCents(input: {
  cartLines: { productId: string; asUpsell?: boolean }[];
  products: UpsellTriggerProduct[];
  rules: UpsellRule[];
  standUpsell: { productId: string; priceCents: number } | null;
  offerProductId: string;
}): number | null {
  if (input.rules.length === 0) return null;
  const byId = new Map(input.products.map((p) => [p.id, p]));
  const triggers = input.cartLines.filter((l) => !l.asUpsell).map((l) => l.productId);
  if (triggers.length === 0 || triggers.every((id) => byId.get(id)?.isPreOrder)) return null;
  const pick = pickTakeNowUpsell({
    triggerProductIds: triggers,
    rules: input.rules,
    legacyByProduct: (id) => {
      const t = byId.get(id);
      return t?.upsellProductId ? { offerProductId: t.upsellProductId, priceCents: t.upsellPriceCents ?? null } : null;
    },
    legacyStand: input.standUpsell
      ? { productId: input.standUpsell.productId, priceCents: input.standUpsell.priceCents }
      : null,
    isAvailable: (id) => id === input.offerProductId,
  });
  if (pick?.source !== "rule") return null;
  return pick.priceCents ?? byId.get(input.offerProductId)?.priceCents ?? null;
}

/** Page-level wins for pre-order carts; then product-level; then stand fallback. */
export function resolveCartUpsell(input: {
  cartLines: { productId: string; asUpsell?: boolean }[];
  products: PublicProductCard[];
  standUpsell: CartUpsellOffer | null;
  pagePreOrderUpsells?: PagePreOrderUpsell[];
  standPreOrderUpsell: StandPreOrderUpsell;
  rules?: UpsellRule[];
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

  const pick = pickTakeNowUpsell({
    triggerProductIds: nonUpsell.map((l) => l.productId),
    rules: input.rules ?? [],
    legacyByProduct: (id) => {
      const trigger = byId.get(id);
      return trigger?.upsellProductId
        ? { offerProductId: trigger.upsellProductId, priceCents: trigger.upsellPriceCents ?? null }
        : null;
    },
    legacyStand: input.standUpsell
      ? { productId: input.standUpsell.productId, priceCents: input.standUpsell.priceCents }
      : null,
    isAvailable: (id) => {
      if (input.cartLines.some((l) => l.productId === id)) return false;
      if (input.standUpsell?.productId === id) return input.standUpsell.stockQuantity > 0;
      return (byId.get(id)?.stockQuantity ?? 0) > 0;
    },
  });
  if (!pick) return null;
  if (pick.source === "legacy-stand" && input.standUpsell) return input.standUpsell;
  const offer = byId.get(pick.productId);
  if (!offer) return null;
  return {
    productId: offer.id,
    name: offer.name,
    priceCents: pick.priceCents ?? offer.priceCents,
    stockQuantity: offer.stockQuantity,
  };
}
