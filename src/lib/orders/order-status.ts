import type {
  CollectionStatus,
  FulfilmentStatus,
  HandoverMode,
  PaymentStatus,
  SaleOrigin,
} from "@/generated/prisma/client";
import type { PillSpec } from "@/components/dashboard/ui/StatusPill";
import { isCountedPaymentStatus } from "@/lib/order-metrics";

export function orderPaymentPill(order: {
  paymentStatus: PaymentStatus;
  refundedCents: number | null;
}): PillSpec {
  switch (order.paymentStatus) {
    case "REFUNDED":
      return { label: "Refunded", tone: "neutral" };
    case "PENDING":
      return { label: "Awaiting payment", tone: "warning" };
    case "FAILED":
      return { label: "Payment failed", tone: "critical" };
    case "EXPIRED":
    case "CANCELLED":
      return { label: "Abandoned", tone: "neutral" };
    case "DEPOSIT_PAID":
    case "BALANCE_DUE":
      return { label: "Deposit paid", tone: "attention" };
    case "BALANCE_FAILED":
      return { label: "Balance failed", tone: "critical" };
    default:
      return (order.refundedCents ?? 0) > 0
        ? { label: "Partially refunded", tone: "attention" }
        : { label: "Paid", tone: "success" };
  }
}

const FULFILMENT_PILLS: Record<FulfilmentStatus, PillSpec> = {
  NEW: { label: "Unfulfilled", tone: "attention" },
  PREPARING: { label: "In progress", tone: "info" },
  READY: { label: "Ready for pickup", tone: "info" },
  COLLECTED: { label: "Collected", tone: "success" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", tone: "info" },
  DELIVERED: { label: "Delivered", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export type OrderFulfilmentInput = {
  paymentStatus: PaymentStatus;
  handoverMode: HandoverMode;
  isPreOrder: boolean;
  collectionStatus: CollectionStatus | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  fulfilment: { fulfilmentStatus: FulfilmentStatus } | null;
};

/** Null for unpaid orders: nothing to hand over yet. */
export function orderFulfilmentPill(order: OrderFulfilmentInput): PillSpec | null {
  if (!isCountedPaymentStatus(order.paymentStatus)) return null;
  if (order.handoverMode === "DELIVER") {
    if (order.deliveredAt) return FULFILMENT_PILLS.DELIVERED;
    if (order.shippedAt) return { label: "Shipped", tone: "info" };
  }
  if (order.collectionStatus === "COLLECTED") return FULFILMENT_PILLS.COLLECTED;
  if (order.fulfilment) return FULFILMENT_PILLS[order.fulfilment.fulfilmentStatus];
  if (order.collectionStatus === "READY") return FULFILMENT_PILLS.READY;
  if (order.isPreOrder || order.handoverMode === "DELIVER") return FULFILMENT_PILLS.NEW;
  return { label: "Fulfilled", tone: "neutral" };
}

export function orderChannelLabel(order: {
  shopperSubscriptionId: string | null;
  isPreOrder: boolean;
  saleOrigin: SaleOrigin;
}): string {
  if (order.shopperSubscriptionId) return "Subscription";
  if (order.isPreOrder) return "Pre-order";
  switch (order.saleOrigin) {
    case "SQUARE_POS":
      return "Square POS";
    case "FARM_STAND":
      return "Stand";
    case "MARKET":
      return "Market";
    case "MANUAL":
      return "Manual";
    default:
      return "Online shop";
  }
}

export function orderDeliveryLabel(order: {
  handoverMode: HandoverMode;
  trackingNumber: string | null;
}): string {
  if (order.handoverMode !== "DELIVER") return "Pickup";
  return order.trackingNumber ? "Tracking added" : "Delivery";
}

export function orderItemCount(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
