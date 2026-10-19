import { z } from "zod";

export const HOME_RANGES = ["today", "yesterday", "7d", "30d"] as const;
export const homeRange = z.enum(HOME_RANGES);
export type HomeRange = z.infer<typeof homeRange>;

export const homeQuery = z.object({
  standId: z.string().min(1),
  range: homeRange.default("today"),
});
export type HomeQuery = z.infer<typeof homeQuery>;

export const salesSummary = z.object({
  salesCents: z.number().int(),
  orderCount: z.number().int(),
  cashCents: z.number().int(),
  digitalCents: z.number().int(),
  currency: z.string(),
});
export type SalesSummary = z.infer<typeof salesSummary>;

export const homeResponse = z.object({
  range: z.object({ key: homeRange, label: z.string() }),
  sales: z.object({
    all: salesSummary,
    stand: salesSummary,
    preorder: salesSummary,
    subscription: salesSummary,
  }),
  previous: salesSummary,
  productCount: z.number().int(),
  lowStock: z.array(
    z.object({ id: z.string(), name: z.string(), stockQuantity: z.number().int() }),
  ),
  recentOrders: z.array(
    z.object({
      id: z.string(),
      orderNumber: z.string(),
      totalCents: z.number().int(),
      currency: z.string(),
      paymentMethod: z.string(),
    }),
  ),
  preOrderPageCount: z.number().int(),
  subscriptionOfferCount: z.number().int(),
  activeSubscriptions: z.number().int(),
});
export type HomeResponse = z.infer<typeof homeResponse>;
