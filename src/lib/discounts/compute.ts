export type DiscountType = "PERCENT_OFF" | "FIXED_OFF" | "FREE_DELIVERY";

export type DiscountRule = {
  type: DiscountType;
  percentOff: number | null;
  amountOffCents: number | null;
  minOrderCents: number;
  /** Chosen products plus every product in the chosen categories. Empty = whole order. */
  scopeProductIds: string[];
};

export type DiscountLine = { productId: string; lineTotalCents: number };

export type CodeDiscount =
  | { ok: true; discountCents: number; freeShipping: boolean }
  | { ok: false; reason: "min_order" | "no_eligible" };

export function eligibleCents(lines: DiscountLine[], scopeProductIds: string[]): number {
  if (scopeProductIds.length === 0) {
    return lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  }
  const scope = new Set(scopeProductIds);
  return lines
    .filter((l) => scope.has(l.productId))
    .reduce((sum, l) => sum + l.lineTotalCents, 0);
}

export function computeCodeDiscount(rule: DiscountRule, lines: DiscountLine[]): CodeDiscount {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  if (subtotal < rule.minOrderCents) return { ok: false, reason: "min_order" };
  const eligible = eligibleCents(lines, rule.scopeProductIds);
  if (eligible <= 0) return { ok: false, reason: "no_eligible" };

  if (rule.type === "FREE_DELIVERY") {
    return { ok: true, discountCents: 0, freeShipping: true };
  }
  if (rule.type === "PERCENT_OFF") {
    const pct = Math.min(100, Math.max(0, rule.percentOff ?? 0));
    return { ok: true, discountCents: Math.round((eligible * pct) / 100), freeShipping: false };
  }
  const amount = Math.max(0, rule.amountOffCents ?? 0);
  return { ok: true, discountCents: Math.min(amount, eligible), freeShipping: false };
}

export type ChosenDiscount = {
  discountCents: number;
  label: string | null;
  usedCode: boolean;
};

/** Shopper gets whichever money discount saves more; ties go to the code. */
export function pickBetterDiscount(
  firstOrder: { discountCents: number; label: string | null },
  code: { discountCents: number; label: string } | null,
): ChosenDiscount {
  if (code && code.discountCents > 0 && code.discountCents >= firstOrder.discountCents) {
    return { discountCents: code.discountCents, label: code.label, usedCode: true };
  }
  return { discountCents: firstOrder.discountCents, label: firstOrder.label, usedCode: false };
}

export function normalizeDiscountCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
