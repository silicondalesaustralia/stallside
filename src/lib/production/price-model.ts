import { taxFromInclusiveCents, taxOnTopCents } from "@/lib/gst";
import { marginPercent, markupPercent, profitCents, suggestedPriceCents } from "./pricing";

export type FeeAssumptions = { feePct: number; fixedFeeCents: number };

export type PriceBreakdown = {
  /** Price after removing included sales tax. */
  netPriceCents: number;
  feesCents: number;
  profitCents: number;
  marginPct: number | null;
  markupPct: number | null;
};

/** Profit, margin and markup after fees for a shelf price (tax-inclusive when `inclusiveTaxBps` > 0). */
export function priceBreakdown(input: {
  priceCents: number;
  unitCostCents: number;
  fees: FeeAssumptions;
  inclusiveTaxBps: number;
}): PriceBreakdown {
  const netPriceCents = input.priceCents - taxFromInclusiveCents(input.priceCents, input.inclusiveTaxBps);
  const profit = profitCents({ priceCents: netPriceCents, unitCostCents: input.unitCostCents, ...input.fees });
  return {
    netPriceCents,
    feesCents: netPriceCents - input.unitCostCents - profit,
    profitCents: profit,
    marginPct: marginPercent(netPriceCents, profit),
    markupPct: markupPercent(input.unitCostCents, profit),
  };
}

/** Shelf price that leaves `marginPct` after fees, with included sales tax added back on. */
export function priceForMargin(input: {
  unitCostCents: number;
  marginPct: number;
  fees: FeeAssumptions;
  inclusiveTaxBps: number;
}): number | null {
  const net = suggestedPriceCents({ unitCostCents: input.unitCostCents, marginPct: input.marginPct, ...input.fees });
  return net == null ? null : net + taxOnTopCents(net, input.inclusiveTaxBps);
}

/** Dollar text → cents; null when blank or invalid. */
export function parseDollarsToCents(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}
