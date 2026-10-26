import { PaymentStatus } from "@/generated/prisma/client";
import { isCountedPaymentStatus } from "@/lib/order-metrics";

export function orderChannelBadge(order: {
  paymentStatus: PaymentStatus;
  shopperSubscriptionId: string | null;
  isPreOrder: boolean;
}): { label: string; className: string } {
  if (order.paymentStatus === PaymentStatus.REFUNDED) {
    return { label: "Refunded", className: "bg-[var(--wash)] text-[var(--muted)]" };
  }
  if (!isCountedPaymentStatus(order.paymentStatus)) {
    return {
      label: "Not Paid",
      className: "bg-[var(--warn)]/15 text-[var(--warn)]",
    };
  }
  if (order.shopperSubscriptionId) {
    return {
      label: "Subscription",
      className: "bg-[var(--leaf)]/15 text-[var(--leaf-dark)]",
    };
  }
  if (order.isPreOrder) {
    return {
      label: "Pre Order",
      className: "bg-[var(--marigold)]/20 text-[var(--field)]",
    };
  }
  return {
    label: "Paid At Stand",
    className: "bg-[var(--wash)] text-[var(--muted)] ring-1 ring-[var(--line)]",
  };
}
