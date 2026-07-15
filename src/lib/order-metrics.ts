import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

export const COUNTED_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
];

export type OrderMetricRow = {
  totalCents: number;
  paymentMethod: PaymentMethod;
  currency: string;
  createdAt: Date;
};

export function summarizeOrders(orders: OrderMetricRow[]) {
  let salesCents = 0;
  let cashCents = 0;
  let digitalCents = 0;
  let currency = "AUD";

  for (const order of orders) {
    currency = order.currency || currency;
    salesCents += order.totalCents;
    if (
      order.paymentMethod === PaymentMethod.CASH ||
      order.paymentMethod === PaymentMethod.LOCAL_TRANSFER
    ) {
      cashCents += order.totalCents;
    } else {
      digitalCents += order.totalCents;
    }
  }

  return {
    salesCents,
    cashCents,
    digitalCents,
    orderCount: orders.length,
    currency,
  };
}
