import { z } from "zod";

export const PROFIT_RANGES = ["7d", "30d", "6m", "12m"] as const;
export const profitRange = z.enum(PROFIT_RANGES);
export type ProfitRange = z.infer<typeof profitRange>;

export const profitQuery = z.object({
  standId: z.string().min(1),
  range: profitRange.default("30d"),
});

export const profitProduct = z.object({
  productId: z.string(),
  name: z.string(),
  units: z.number().int(),
  revenueCents: z.number().int(),
  costCents: z.number().int(),
  /** Units sold with no known cost. */
  unknownCostUnits: z.number().int(),
});
export type ProfitProduct = z.infer<typeof profitProduct>;

/** Same figures as the web Profit & loss page. */
export const profitResponse = z.object({
  rangeLabel: z.string(),
  currency: z.string(),
  /** "GST", "VAT"… or "Tax". */
  taxLabel: z.string(),
  orders: z.number().int(),
  salesCents: z.number().int(),
  gstCents: z.number().int(),
  cogsCents: z.number().int(),
  feesCents: z.number().int(),
  grossProfitCents: z.number().int(),
  /** Gross profit as a % of sales after tax; null without sales. */
  grossMarginPercent: z.number().nullable(),
  suppliesPurchasedCents: z.number().int(),
  batchesMade: z.number().int(),
  productionCostCents: z.number().int(),
  products: z.array(profitProduct),
});
export type ProfitResponse = z.infer<typeof profitResponse>;
