import { z } from "zod";

export const DISCOUNT_TYPES = ["PERCENT_OFF", "FIXED_OFF", "FREE_DELIVERY"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

/** Discount form values; the web form and the app both send this shape. */
export const discountInput = z.object({
  code: z.string().trim().min(2).max(30),
  name: z.string().trim().max(80),
  type: z.enum(DISCOUNT_TYPES),
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
export type DiscountInputValues = z.infer<typeof discountInput>;

export const EMPTY_DISCOUNT_INPUT: DiscountInputValues = {
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

export const discountsQuery = z.object({ standId: z.string().min(1) });

export const mobileDiscountRow = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string().nullable(),
  summary: z.string(),
  uses: z.string(),
  status: z.string().nullable(),
  isActive: z.boolean(),
});
export type MobileDiscountRow = z.infer<typeof mobileDiscountRow>;

export const discountsResponse = z.object({ discounts: z.array(mobileDiscountRow) });
export type DiscountsResponse = z.infer<typeof discountsResponse>;

export const discountDetail = z.object({ id: z.string(), input: discountInput });
export type DiscountDetail = z.infer<typeof discountDetail>;

export const createDiscountBody = z.object({ standId: z.string().min(1), input: discountInput });
export const updateDiscountBody = z.object({ input: discountInput });
export const discountActiveBody = z.object({ isActive: z.boolean() });
export const discountSaveResponse = z.object({ id: z.string() });
export type DiscountSaveResponse = z.infer<typeof discountSaveResponse>;
