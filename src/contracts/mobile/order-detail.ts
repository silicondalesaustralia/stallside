import { z } from "zod";

export const mobileOrderDetail = z.object({
  id: z.string(),
  orderNumber: z.string(),
  standName: z.string(),
  createdAt: z.iso.datetime(),
  totalCents: z.number().int(),
  currency: z.string(),
  channelLabel: z.string(),
  paymentLabel: z.string(),
  paymentStatusLabel: z.string(),
  restoresStockOnDelete: z.boolean(),
  customer: z.object({
    name: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
  }),
  delivery: z
    .object({
      label: z.string(),
      address: z.string().nullable(),
      notes: z.string().nullable(),
    })
    .nullable(),
  canShip: z.boolean(),
  carriers: z.array(z.string()),
  shipping: z.object({
    carrier: z.string().nullable(),
    trackingNumber: z.string().nullable(),
    trackingUrl: z.string().nullable(),
    shippedAt: z.iso.datetime().nullable(),
    deliveredAt: z.iso.datetime().nullable(),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      options: z.string().nullable(),
      quantity: z.number().int(),
      lineTotalCents: z.number().int(),
    }),
  ),
});
export type MobileOrderDetail = z.infer<typeof mobileOrderDetail>;

export const shipOrderBody = z.object({
  carrier: z.string().trim().max(60),
  trackingNumber: z.string().trim().max(100).default(""),
  trackingUrl: z.string().trim().max(500).default(""),
});
export type ShipOrderBody = z.infer<typeof shipOrderBody>;

export const shipOrderResponse = z.object({ message: z.string() });
export type ShipOrderResponse = z.infer<typeof shipOrderResponse>;
