import { z } from "zod";

export const ordersQuery = z.object({
  standId: z.string().min(1),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type OrdersQuery = z.infer<typeof ordersQuery>;

export const mobileOrderSummary = z.object({
  id: z.string(),
  orderNumber: z.string(),
  totalCents: z.number().int(),
  currency: z.string(),
  createdAt: z.iso.datetime(),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  customerName: z.string().nullable(),
  isPreOrder: z.boolean(),
  handoverMode: z.string(),
  collectionStatus: z.string().nullable(),
  shippedAt: z.iso.datetime().nullable(),
  deliveredAt: z.iso.datetime().nullable(),
  itemCount: z.number().int(),
  items: z.array(
    z.object({ name: z.string(), quantity: z.number().int() }),
  ),
});
export type MobileOrderSummary = z.infer<typeof mobileOrderSummary>;

export const ordersResponse = z.object({
  orders: z.array(mobileOrderSummary),
  nextCursor: z.string().nullable(),
});
export type OrdersResponse = z.infer<typeof ordersResponse>;
