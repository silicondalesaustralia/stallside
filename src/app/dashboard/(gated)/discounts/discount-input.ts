import { z } from "zod";

export const discountSchema = z.object({
  code: z.string().trim().min(2).max(30),
  name: z.string().trim().max(80),
  type: z.enum(["PERCENT_OFF", "FIXED_OFF", "FREE_DELIVERY"]),
  value: z.string().trim().max(12),
  minOrder: z.string().trim().max(12),
  wholeOrder: z.boolean(),
  categoryIds: z.array(z.string().min(1)).max(500),
  productIds: z.array(z.string().min(1)).max(2000),
  showOnWebsite: z.boolean(),
  showAtStall: z.boolean(),
  startsOn: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  endsOn: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  usageLimit: z.string().trim().max(7),
  perCustomerLimit: z.string().trim().max(4),
  firstOrderOnly: z.boolean(),
  isActive: z.boolean(),
});

export type DiscountInput = z.infer<typeof discountSchema>;

export const EMPTY_DISCOUNT: DiscountInput = {
  code: "",
  name: "",
  type: "PERCENT_OFF",
  value: "",
  minOrder: "",
  wholeOrder: true,
  categoryIds: [],
  productIds: [],
  showOnWebsite: true,
  showAtStall: true,
  startsOn: "",
  endsOn: "",
  usageLimit: "",
  perCustomerLimit: "1",
  firstOrderOnly: false,
  isActive: true,
};

export function parseMoneyCents(raw: string): number | null | "invalid" {
  if (!raw) return null;
  const value = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(value) && value >= 0 && value <= 100000 ? Math.round(value * 100) : "invalid";
}

export function parseCount(raw: string): number | null | "invalid" {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : "invalid";
}
