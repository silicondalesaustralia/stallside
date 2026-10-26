import DetailCard from "@/components/dashboard/ui/DetailCard";
import { orderChannelLabel } from "@/lib/orders/order-status";
import { orderPaymentLabel } from "@/lib/order-payment-label";
import type { OrderDetail } from "@/lib/orders/load-order-detail";

function Line({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 break-all">{value}</dd>
    </div>
  );
}

/** Channel, payment method and provider references for support and reconciliation. */
export default function OrderInfoCard({ order }: { order: OrderDetail }) {
  return (
    <DetailCard title="Additional details">
      <dl className="space-y-3 text-sm">
        <Line label="Business" value={order.stand.name} />
        <Line label="Channel" value={orderChannelLabel(order)} />
        <Line label="Payment method" value={orderPaymentLabel(order.paymentMethod, order.localTransferMethodId)} />
        <Line label="Stripe payment" value={order.stripePaymentIntentId} />
        <Line label="Square payment" value={order.squarePaymentId} />
        <Line label="PayPal capture" value={order.paypalCaptureId} />
      </dl>
    </DetailCard>
  );
}
