import type { MobileOrderDetail } from "@contracts/mobile/order-detail";
import CardRefundCard from "@/components/CardRefundCard";
import MarkPaidCard from "@/components/MarkPaidCard";
import PayPalRefundCard from "@/components/PayPalRefundCard";

/** Mark paid or refund, whichever the order's payment allows (same rules as the web order page). */
export default function OrderPaymentCard({
  order,
}: {
  order: MobileOrderDetail;
}) {
  const action = order.paymentAction;
  if (!action) return null;
  if (action.kind === "mark_paid")
    return <MarkPaidCard orderId={order.id} payAtPickup={action.payAtPickup} />;
  if (action.kind === "paypal") {
    return (
      <PayPalRefundCard
        orderId={order.id}
        refundUrl={action.refundUrl}
        refundedCents={action.refundedCents}
        totalCents={order.totalCents}
        currency={order.currency}
      />
    );
  }
  return (
    <CardRefundCard
      key={action.remainingCents}
      orderId={order.id}
      provider={action.provider}
      remainingCents={action.remainingCents}
      refundedCents={action.refundedCents}
      currency={order.currency}
    />
  );
}
