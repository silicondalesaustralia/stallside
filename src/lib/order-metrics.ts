import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import {
  orderSalesChannel,
  type SalesChannel,
} from "@/lib/sales-series";

export const COUNTED_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

export type OrderMetricRow = {
  totalCents: number;
  paymentMethod: PaymentMethod;
  currency: string;
  createdAt: Date;
};

export type ChannelMetricRow = OrderMetricRow & {
  isPreOrder: boolean;
  shopperSubscriptionId: string | null;
};

export type OrderSummary = {
  salesCents: number;
  cashCents: number;
  digitalCents: number;
  orderCount: number;
  currency: string;
  hasCash: boolean;
  hasCheckout: boolean;
};

export function summarizeOrders(orders: OrderMetricRow[]): OrderSummary {
  let salesCents = 0;
  let cashCents = 0;
  let digitalCents = 0;
  let currency = "AUD";
  let hasCash = false;
  let hasCheckout = false;

  for (const order of orders) {
    currency = order.currency || currency;
    salesCents += order.totalCents;
    if (
      order.paymentMethod === PaymentMethod.CASH ||
      order.paymentMethod === PaymentMethod.LOCAL_TRANSFER
    ) {
      cashCents += order.totalCents;
      hasCash = true;
    } else {
      digitalCents += order.totalCents;
      hasCheckout = true;
    }
  }

  return {
    salesCents,
    cashCents,
    digitalCents,
    orderCount: orders.length,
    currency,
    hasCash,
    hasCheckout,
  };
}

export function filterOrdersByChannels(
  orders: ChannelMetricRow[],
  mode: "all" | "channels",
  enabled: Record<SalesChannel, boolean>,
): ChannelMetricRow[] {
  if (mode === "all") return orders;
  return orders.filter((order) => enabled[orderSalesChannel(order)]);
}
