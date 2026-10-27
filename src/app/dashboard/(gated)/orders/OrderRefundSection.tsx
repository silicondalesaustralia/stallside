import { PaymentMethod, PaymentStatus, type PaymentTiming } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { awaitingPickupPayment } from "@/lib/pay-at-pickup";
import { isCountedPaymentStatus } from "@/lib/order-metrics";
import { paypalTransactionUrl } from "@/lib/paypal-refunds";
import CardRefundPanel from "./CardRefundPanel";
import MarkPaidPanel from "./MarkPaidPanel";
import PayPalRefundPanel from "./PayPalRefundPanel";

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

export default function OrderRefundSection({ order }: { order: OrderRefundFields }) {
  if (
    order.paymentStatus === PaymentStatus.CUSTOMER_CONFIRMED &&
    (order.paymentMethod === PaymentMethod.CASH || order.paymentMethod === PaymentMethod.LOCAL_TRANSFER)
  ) {
    return <MarkPaidPanel orderId={order.id} payAtPickup={awaitingPickupPayment(order)} />;
  }
  if (order.paymentMethod === PaymentMethod.PAYPAL && order.paypalCaptureId) {
    return (
      <PayPalRefundPanel
        orderId={order.id}
        refundUrl={paypalTransactionUrl(order.paypalCaptureId)}
        refundedCents={order.refundedCents}
        totalCents={order.totalCents}
        currency={order.currency}
      />
    );
  }

  const provider =
    order.paymentMethod === PaymentMethod.CARD && order.stripePaymentIntentId
      ? "Stripe"
      : order.paymentMethod === PaymentMethod.SQUARE && order.squarePaymentId
        ? "Square"
        : null;
  if (!provider || !isCountedPaymentStatus(order.paymentStatus)) return null;

  const refunded = order.refundedCents ?? 0;
  const remaining = collectedCents(order) - refunded;
  if (remaining <= 0) return null;

  return (
    <div>
      {refunded > 0 ? (
        <span className="mt-2 inline-block rounded-full bg-[var(--marigold)]/20 px-2.5 py-0.5 text-xs font-semibold text-[var(--field)]">
          Partially refunded {formatMoney(refunded, order.currency)}
        </span>
      ) : null}
      <CardRefundPanel
        orderId={order.id}
        provider={provider}
        remainingCents={remaining}
        currency={order.currency}
      />
    </div>
  );
}
