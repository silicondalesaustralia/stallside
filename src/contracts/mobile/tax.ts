import { z } from "zod";

export const mobileTaxRegion = z.object({
  country: z.string(),
  label: z.string(),
  /** "GST", "VAT", "Sales tax"… */
  name: z.string(),
  /** e.g. "10"; null when the owner must enter their own (US, Canada). */
  defaultRate: z.string().nullable(),
  /** Shelf prices include the tax; otherwise it's added at checkout. */
  inclusive: z.boolean(),
  idLabel: z.string(),
});
export type MobileTaxRegion = z.infer<typeof mobileTaxRegion>;

export const taxSettingsResponse = z.object({
  /** e.g. "GST on at 10%, included in your prices." */
  status: z.string(),
  country: z.string(),
  /** The owner's own rate as a percentage, or "" for the country default. */
  rate: z.string(),
  taxId: z.string(),
  registered: z.boolean(),
  taxShipping: z.boolean(),
  regions: z.array(mobileTaxRegion),
  taxFreeProducts: z.array(z.object({ id: z.string(), name: z.string(), standName: z.string() })),
  taxFreeTotal: z.number().int(),
});
export type TaxSettingsResponse = z.infer<typeof taxSettingsResponse>;

export const taxSettingsBody = z.object({
  country: z.string().trim().length(2),
  rate: z.string().trim().max(10),
  taxId: z.string().trim().max(30),
  registered: z.boolean(),
  taxShipping: z.boolean(),
});
export type TaxSettingsBody = z.infer<typeof taxSettingsBody>;

export const taxSyncResponse = z.object({ message: z.string() });
