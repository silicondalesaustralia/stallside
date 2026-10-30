import { formatMoney } from "@/lib/money";
import { orderPaymentAction, type OrderRefundFields } from "@/lib/orders/payment-action";
import CardRefundPanel from "./CardRefundPanel";
import MarkPaidPanel from "./MarkPaidPanel";
import PayPalRefundPanel from "./PayPalRefundPanel";

export type { OrderRefundFields };

export default function OrderRefundSection({ order }: { order: OrderRefundFields }) {
  const action = orderPaymentAction(order);
  if (!action) return null;
  if (action.kind === "mark_paid") {
    return <MarkPaidPanel orderId={order.id} payAtPickup={action.payAtPickup} />;
  }
  if (action.kind === "paypal") {
    return (
      <PayPalRefundPanel
        orderId={order.id}
        refundUrl={action.refundUrl}
        refundedCents={order.refundedCents}
        totalCents={order.totalCents}
        currency={order.currency}
      />
    );
  }

  return (
    <div>
      {action.refundedCents > 0 ? (
        <span className="mt-2 inline-block rounded-full bg-[var(--marigold)]/20 px-2.5 py-0.5 text-xs font-semibold text-[var(--field)]">
          Partially refunded {formatMoney(action.refundedCents, order.currency)}
        </span>
      ) : null}
      <CardRefundPanel
        orderId={order.id}
        provider={action.provider}
        remainingCents={action.remainingCents}
        currency={order.currency}
      />
    </div>
  );
}
