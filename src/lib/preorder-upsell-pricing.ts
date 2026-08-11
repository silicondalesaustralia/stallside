export type AddonDiscountKind = "PERCENT" | "AMOUNT";

export type AddonPricing = {
  /** Regular / list price shown struck through when discounted. */
  listCents: number;
  /** Amount charged. */
  saleCents: number;
  /** List price when higher than sale; otherwise null. */
  compareAtCents: number | null;
};

/** Sale price from list + optional % or fixed amount off. */
export function resolveAddonPricing(
  listCents: number,
  kind: string | null | undefined,
  value: number | null | undefined,
): AddonPricing {
  const list = Math.max(0, Math.round(listCents));
  if (!kind || value == null || value <= 0) {
    return { listCents: list, saleCents: list, compareAtCents: null };
  }
  let off = 0;
  if (kind === "PERCENT") {
    const pct = Math.min(100, Math.max(0, Math.round(value)));
    off = Math.round((list * pct) / 100);
  } else if (kind === "AMOUNT") {
    off = Math.min(list, Math.max(0, Math.round(value)));
  }
  const sale = Math.max(0, list - off);
  return {
    listCents: list,
    saleCents: sale,
    compareAtCents: sale < list ? list : null,
  };
}

export function parseAddonDiscountKind(
  raw: string,
): AddonDiscountKind | null {
  if (raw === "PERCENT" || raw === "AMOUNT") return raw;
  return null;
}
