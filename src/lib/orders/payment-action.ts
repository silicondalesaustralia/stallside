import { PaymentMethod, PaymentStatus, type PaymentTiming } from "@/generated/prisma/client";
import { awaitingPickupPayment } from "@/lib/pay-at-pickup";
import { isCountedPaymentStatus } from "@/lib/order-metrics";
import { paypalTransactionUrl } from "@/lib/paypal-refunds";

export type OrderRefundFields = {
  id: string;
  totalCents: number;
  depositCents: number | null;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTiming: PaymentTiming;
  paypalCaptureId: string | null;
  stripePaymentIntentId: string | null;
  squarePaymentId: string | null;
  refundedCents: number | null;
};

/** What the owner can do about an order's money, shared by the web order page and the app. */
export type OrderPaymentAction =
  | { kind: "mark_paid"; payAtPickup: boolean }
  | { kind: "paypal"; refundUrl: string; refundedCents: number }
  | { kind: "card"; provider: "Stripe" | "Square"; remainingCents: number; refundedCents: number };

const DEPOSIT_ONLY: PaymentStatus[] = [
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

/** What the customer has actually paid so far (deposit orders may still owe a balance). */
function collectedCents(order: OrderRefundFields): number {
  return DEPOSIT_ONLY.includes(order.paymentStatus)
    ? order.depositCents ?? order.totalCents
    : order.totalCents;
}

function cardProvider(order: OrderRefundFields): "Stripe" | "Square" | null {
  if (order.paymentMethod === PaymentMethod.CARD && order.stripePaymentIntentId) return "Stripe";
  if (order.paymentMethod === PaymentMethod.SQUARE && order.squarePaymentId) return "Square";
  return null;
}

export function orderPaymentAction(order: OrderRefundFields): OrderPaymentAction | null {
  if (
    order.paymentStatus === PaymentStatus.CUSTOMER_CONFIRMED &&
    (order.paymentMethod === PaymentMethod.CASH || order.paymentMethod === PaymentMethod.LOCAL_TRANSFER)
  ) {
    return { kind: "mark_paid", payAtPickup: awaitingPickupPayment(order) };
  }
  const refundedCents = order.refundedCents ?? 0;
  if (order.paymentMethod === PaymentMethod.PAYPAL && order.paypalCaptureId) {
    return { kind: "paypal", refundUrl: paypalTransactionUrl(order.paypalCaptureId), refundedCents };
  }

  const provider = cardProvider(order);
  if (!provider || !isCountedPaymentStatus(order.paymentStatus)) return null;
  const remainingCents = collectedCents(order) - refundedCents;
  if (remainingCents <= 0) return null;
  return { kind: "card", provider, remainingCents, refundedCents };
}
