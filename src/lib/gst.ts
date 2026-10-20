/** Australian GST is 10%, and consumer prices must be shown GST-inclusive, so GST = 1/11 of price. */
export function gstFromInclusiveCents(cents: number): number {
  return cents > 0 ? Math.round(cents / 11) : 0;
}

export function gstApplies(
  owner: { gstRegistered: boolean },
  currency: string,
): boolean {
  return owner.gstRegistered && currency.trim().toUpperCase() === "AUD";
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

/** Per-line GST after discount; zero everywhere when GST does not apply. */
export function lineGstCents(
  lines: GstLineInput[],
  discountCents: number,
  applies: boolean,
): number[] {
  if (!applies) return lines.map(() => 0);
  const discounts = allocateDiscount(
    lines.map((l) => l.lineTotalCents),
    discountCents,
  );
  return lines.map((line, i) =>
    line.gstFree ? 0 : gstFromInclusiveCents(line.lineTotalCents - discounts[i]),
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
