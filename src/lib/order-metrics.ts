import {
  orderSalesChannel,
  type SalesChannel,
} from "@/lib/sales-series";

export type CountedPaymentStatus =
  | "PAID"
  | "CUSTOMER_CONFIRMED"
  | "DEPOSIT_PAID"
  | "BALANCE_DUE"
  | "BALANCE_FAILED";

/** Statuses that count toward sales charts / totals. Mutable for Prisma `in` filters. */
export const COUNTED_STATUSES: CountedPaymentStatus[] = [
  "PAID",
  "CUSTOMER_CONFIRMED",
  "DEPOSIT_PAID",
  "BALANCE_DUE",
  "BALANCE_FAILED",
];

export function isCountedPaymentStatus(status: string): boolean {
  return COUNTED_STATUSES.includes(status as CountedPaymentStatus);
}

export type OrderMetricRow = {
  totalCents: number;
  paymentMethod: string;
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
  cashOrderCount: number;
  checkoutOrderCount: number;
};

function isCashLike(method: string) {
  return method === "CASH" || method === "LOCAL_TRANSFER";
}

export function summarizeOrders(orders: OrderMetricRow[]): OrderSummary {
  let salesCents = 0;
  let cashCents = 0;
  let digitalCents = 0;
  let currency = "AUD";
  let cashOrderCount = 0;
  let checkoutOrderCount = 0;

  for (const order of orders) {
    currency = order.currency || currency;
    salesCents += order.totalCents;
    if (isCashLike(order.paymentMethod)) {
      cashCents += order.totalCents;
      cashOrderCount += 1;
    } else {
      digitalCents += order.totalCents;
      checkoutOrderCount += 1;
    }
  }

  return {
    salesCents,
    cashCents,
    digitalCents,
    orderCount: orders.length,
    currency,
    cashOrderCount,
    checkoutOrderCount,
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
