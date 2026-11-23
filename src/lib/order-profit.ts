/**
 * Gross profit for counted sales: sales − GST − COGS − platform/card fees.
 * COGS uses supplier unit at sale, else the product's current unit cost.
 * Lines with no cost are excluded from COGS (profit is overstated until cost is set).
 */

export type OrderProfitItem = {
  productId: string;
  name: string;
  quantity: number;
  lineTotalCents: number;
  unitCostCents: number | null;
};

export type OrderProfitBreakdown = {
  cogsCents: number;
  feesCents: number;
  gstCents: number;
  grossProfitCents: number;
  unknownCostUnits: number;
  costIncomplete: boolean;
};

export function orderProfitFromParts(input: {
  totalCents: number;
  gstCents: number;
  platformFeeCents: number;
  processorFeeCents: number | null;
  items: Array<{ quantity: number; unitCostCents: number | null }>;
}): OrderProfitBreakdown {
  let cogsCents = 0;
  let unknownCostUnits = 0;
  for (const item of input.items) {
    if (item.unitCostCents == null) unknownCostUnits += item.quantity;
    else cogsCents += item.unitCostCents * item.quantity;
  }
  const feesCents = input.platformFeeCents + (input.processorFeeCents ?? 0);
  return {
    cogsCents,
    feesCents,
    gstCents: input.gstCents,
    grossProfitCents: input.totalCents - input.gstCents - cogsCents - feesCents,
    unknownCostUnits,
    costIncomplete: unknownCostUnits > 0,
  };
}

export const PROFIT_COGS_CAVEAT =
  "Profit uses each product’s cost (COGS). Add cost on the product for accuracy — missing costs make profit look higher than it is.";
