import { z } from "zod";

export const preOrdersQuery = z.object({ standId: z.string().min(1) });

export const mobilePreOrderPage = z.object({
  id: z.string(),
  title: z.string(),
  isActive: z.boolean(),
  /** Collection day in the business's time zone, e.g. "Sat 25 Oct, 9:00 am". */
  collectionLabel: z.string(),
  orderByLabel: z.string(),
  /** False once the order-by time has passed. */
  ordersOpen: z.boolean(),
  productCount: z.number().int(),
  url: z.string(),
});
export type MobilePreOrderPage = z.infer<typeof mobilePreOrderPage>;

export const preOrdersResponse = z.object({ pages: z.array(mobilePreOrderPage) });
export type PreOrdersResponse = z.infer<typeof preOrdersResponse>;

export const mobilePreOrderItem = z.object({
  productId: z.string(),
  name: z.string(),
  priceCents: z.number().int(),
  /** Null when stock isn't tracked. */
  stock: z.number().int().nullable(),
  imageUrl: z.string().nullable(),
  hidden: z.boolean(),
});
export type MobilePreOrderItem = z.infer<typeof mobilePreOrderItem>;

export const preOrderDetailResponse = z.object({
  page: mobilePreOrderPage,
  collectionNote: z.string().nullable(),
  paymentTiming: z.enum(["PAY_NOW", "PAY_UPFRONT", "DEPOSIT_THEN_BALANCE"]),
  depositPercent: z.number().int().nullable(),
  handoverMode: z.enum(["COLLECT", "DELIVER"]),
  currency: z.string(),
  items: z.array(mobilePreOrderItem),
  /** PNG of the page link as a data: URL. */
  qrImage: z.string(),
});
export type PreOrderDetailResponse = z.infer<typeof preOrderDetailResponse>;

export const preOrderActiveBody = z.object({ isActive: z.boolean() });
