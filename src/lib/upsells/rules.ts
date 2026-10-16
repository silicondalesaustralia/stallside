/** An Upsell row ready for matching, with its categories expanded to the products in them. */
export type UpsellRule = {
  id: string;
  offerProductId: string;
  priceCents: number | null;
  sitewide: boolean;
  productIds: string[];
  categoryProductIds: string[];
};

/** Older per-product setting: this product offers another. */
export type LegacyProductUpsell = { offerProductId: string; priceCents: number | null };

export type TakeNowUpsellInput = {
  triggerProductIds: string[];
  rules: UpsellRule[];
  legacyByProduct: (productId: string) => LegacyProductUpsell | null;
  legacyStand: { productId: string; priceCents: number } | null;
  /** Offer is in stock and not already in the cart (the checkout narrows this to one product). */
  isAvailable: (productId: string) => boolean;
};

export type TakeNowUpsellPick = {
  productId: string;
  /** Special price, or null for the product's normal price. */
  priceCents: number | null;
  source: "rule" | "legacy-product" | "legacy-stand";
};

function ruleFor(input: TakeNowUpsellInput, matches: (rule: UpsellRule) => boolean): TakeNowUpsellPick | null {
  const rule = input.rules.find((r) => matches(r) && input.isAvailable(r.offerProductId));
  return rule ? { productId: rule.offerProductId, priceCents: rule.priceCents, source: "rule" } : null;
}

/**
 * Take-now cart upsell, most specific first: product upsells, the product's own older setting,
 * category upsells, sitewide upsells, then the business's older default.
 */
export function pickTakeNowUpsell(input: TakeNowUpsellInput): TakeNowUpsellPick | null {
  const triggers = input.triggerProductIds;
  if (triggers.length === 0) return null;
  const forProduct = ruleFor(input, (r) => r.productIds.some((id) => triggers.includes(id)));
  if (forProduct) return forProduct;
  for (const id of triggers) {
    const legacy = input.legacyByProduct(id);
    if (legacy && input.isAvailable(legacy.offerProductId)) {
      return { productId: legacy.offerProductId, priceCents: legacy.priceCents, source: "legacy-product" };
    }
  }
  const forCategory = ruleFor(input, (r) => r.categoryProductIds.some((id) => triggers.includes(id)));
  if (forCategory) return forCategory;
  const sitewide = ruleFor(input, (r) => r.sitewide);
  if (sitewide) return sitewide;
  const stand = input.legacyStand;
  return stand && input.isAvailable(stand.productId)
    ? { productId: stand.productId, priceCents: stand.priceCents, source: "legacy-stand" }
    : null;
}
