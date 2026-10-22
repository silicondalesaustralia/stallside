/** Price that leaves `marginPct` of the sale price as profit after percentage and fixed fees. */
export function suggestedPriceCents(input: {
  unitCostCents: number;
  marginPct: number;
  feePct: number;
  fixedFeeCents: number;
}): number | null {
  const keep = 1 - input.marginPct / 100 - input.feePct / 100;
  if (keep <= 0) return null;
  return Math.ceil((input.unitCostCents + input.fixedFeeCents) / keep);
}

/** Profit per unit after fees. */
export function profitCents(input: {
  priceCents: number;
  unitCostCents: number;
  feePct: number;
  fixedFeeCents: number;
}): number {
  const fees = (input.priceCents * input.feePct) / 100 + input.fixedFeeCents;
  return input.priceCents - input.unitCostCents - fees;
}

/** Profit as a percentage of the selling price. */
export function marginPercent(priceCents: number, profit: number): number | null {
  if (priceCents <= 0) return null;
  return (profit / priceCents) * 100;
}

/** Profit as a percentage of cost. */
export function markupPercent(unitCostCents: number, profit: number): number | null {
  if (unitCostCents <= 0) return null;
  return (profit / unitCostCents) * 100;
}

export function formatPercent(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}
