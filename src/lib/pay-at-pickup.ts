import type { PaymentStatus, PaymentTiming } from "@/generated/prisma/client";

/** Pay-at-pickup pre-order the owner hasn't marked paid yet. Client-safe. */
export function awaitingPickupPayment(order: {
  paymentTiming: PaymentTiming;
  paymentStatus: PaymentStatus;
}): boolean {
  return order.paymentTiming === "PAY_AT_PICKUP" && order.paymentStatus === "CUSTOMER_CONFIRMED";
}
