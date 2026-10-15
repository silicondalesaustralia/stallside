import { dollarsToCents } from "@/lib/money";

/** A product is on sale when its "was" price is above what customers pay. */
export function isOnSale(priceCents: number, compareAtPriceCents: number | null | undefined): boolean {
  return compareAtPriceCents != null && compareAtPriceCents > priceCents;
}

/** Reads the optional "Was price" field; blank clears it. */
export function parseCompareAtPrice(
  formData: FormData,
  priceCents: number,
): { ok: true; cents: number | null } | { ok: false; error: string } {
  const raw = String(formData.get("compareAtPrice") ?? "").trim();
  if (!raw) return { ok: true, cents: null };
  let cents: number;
  try {
    cents = dollarsToCents(raw.replace(/,/g, ""));
  } catch {
    return { ok: false, error: "Invalid 'Was' price." };
  }
  if (cents <= priceCents) {
    return { ok: false, error: "The 'Was' price must be higher than the price, or left blank." };
  }
  return { ok: true, cents };
}
