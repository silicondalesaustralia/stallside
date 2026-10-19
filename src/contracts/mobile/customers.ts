import { z } from "zod";

export const customersQuery = z.object({ q: z.string().trim().max(100).optional() });
export type CustomersQuery = z.infer<typeof customersQuery>;

export const customerSummary = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  orderCount: z.number().int(),
  spendCents: z.number().int(),
  currency: z.string(),
  marketingConsent: z.boolean(),
});
export type CustomerSummary = z.infer<typeof customerSummary>;

export const customersResponse = z.object({ customers: z.array(customerSummary) });
export type CustomersResponse = z.infer<typeof customersResponse>;

export const customerDetail = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  notes: z.string().nullable(),
  marketingConsent: z.boolean(),
  source: z.string().nullable(),
  currency: z.string(),
  insight: z.object({
    orderCount: z.number().int(),
    spendCents: z.number().int(),
    aovCents: z.number().int(),
    lastOrderAt: z.iso.datetime().nullable(),
    productNames: z.array(z.string()),
  }),
  orders: z.array(
    z.object({
      id: z.string(),
      orderNumber: z.string(),
      totalCents: z.number().int(),
      currency: z.string(),
      createdAt: z.iso.datetime(),
      standName: z.string(),
      paymentLabel: z.string(),
      paymentStatusLabel: z.string(),
    }),
  ),
  subscriptions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
      billingPlan: z.string().nullable(),
    }),
  ),
});
export type CustomerDetail = z.infer<typeof customerDetail>;

export const customerNotesBody = z.object({ notes: z.string().max(4000) });
export type CustomerNotesBody = z.infer<typeof customerNotesBody>;
