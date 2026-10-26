import type { TaxRule } from "./tax/config";

/** Australian GST is 10%, and consumer prices must be shown GST-inclusive, so GST = 1/11 of price. */
export function gstFromInclusiveCents(cents: number): number {
  return cents > 0 ? Math.round(cents / 11) : 0;
}

/** Tax inside a tax-inclusive price, e.g. 1/11 at 10%. */
export function taxFromInclusiveCents(cents: number, rateBps: number): number {
  return cents > 0 && rateBps > 0 ? Math.round((cents * rateBps) / (10_000 + rateBps)) : 0;
}

/** Tax added on top of a tax-exclusive price. */
export function taxOnTopCents(cents: number, rateBps: number): number {
  return cents > 0 && rateBps > 0 ? Math.round((cents * rateBps) / 10_000) : 0;
}

/** Split an order-level discount across lines in proportion to line totals. */
export function allocateDiscount(
  lineTotals: number[],
  discountCents: number,
): number[] {
  const subtotal = lineTotals.reduce((sum, cents) => sum + cents, 0);
  if (discountCents <= 0 || subtotal <= 0) return lineTotals.map(() => 0);
  const capped = Math.min(discountCents, subtotal);
  let remaining = capped;
  return lineTotals.map((cents, i) => {
    if (i === lineTotals.length - 1) return remaining;
    const share = Math.floor((capped * cents) / subtotal);
    remaining -= share;
    return share;
  });
}

export type GstLineInput = { lineTotalCents: number; gstFree: boolean };

/** Per-line tax after discount (inside the price, or on top of it); zero everywhere when `rule` is null. */
export function lineGstCents(
  lines: GstLineInput[],
  discountCents: number,
  rule: TaxRule | null,
): number[] {
  if (!rule) return lines.map(() => 0);
  const discounts = allocateDiscount(
    lines.map((l) => l.lineTotalCents),
    discountCents,
  );
  const tax = rule.inclusive ? taxFromInclusiveCents : taxOnTopCents;
  return lines.map((line, i) =>
    line.gstFree ? 0 : tax(line.lineTotalCents - discounts[i], rule.rateBps),
  );
}

/** Sales after discount split into GST-free and taxable (GST-inclusive) amounts. */
export function splitSalesByGst(
  lines: GstLineInput[],
  discountCents: number,
): { gstFreeCents: number; taxableCents: number } {
  const discounts = allocateDiscount(
    lines.map((l) => l.lineTotalCents),
    discountCents,
  );
  let gstFreeCents = 0;
  let taxableCents = 0;
  lines.forEach((line, i) => {
    const net = line.lineTotalCents - discounts[i];
    if (line.gstFree) gstFreeCents += net;
    else taxableCents += net;
  });
  return { gstFreeCents, taxableCents };
}
