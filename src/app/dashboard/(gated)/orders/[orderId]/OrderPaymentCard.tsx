import DetailCard from "@/components/dashboard/ui/DetailCard";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { formatMoney } from "@/lib/money";
import { orderItemCount, orderPaymentPill } from "@/lib/orders/order-status";
import { orderPaymentLabel } from "@/lib/order-payment-label";
import type { OrderDetail } from "@/lib/orders/load-order-detail";
import { taxLabel, type TaxConfig } from "@/lib/tax/config";
import OrderRefundSection from "../OrderRefundSection";

function Row({
  label,
  note,
  value,
  strong,
}: {
  label: string;
  note?: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[8rem_1fr_auto] gap-3 py-1 ${strong ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span className="truncate text-[var(--muted)]">{note}</span>
      <span className="font-receipt text-right">{value}</span>
    </div>
  );
}

const DEPOSIT_ONLY = ["DEPOSIT_PAID", "BALANCE_DUE", "BALANCE_FAILED"];

export default function OrderPaymentCard({ order, tax }: { order: OrderDetail; tax: TaxConfig }) {
  const money = (cents: number) => formatMoney(cents, order.currency);
  const items = orderItemCount(order.items);
  const depositOnly = DEPOSIT_ONLY.includes(order.paymentStatus);
  const paid = depositOnly ? order.depositCents ?? 0 : order.totalCents;
  const refunded = order.refundedCents ?? (order.paymentStatus === "REFUNDED" ? order.totalCents : 0);

  return (
    <DetailCard badge={<StatusPill {...orderPaymentPill(order)} />}>
      <div className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm">
        <Row label="Subtotal" note={`${items} item${items === 1 ? "" : "s"}`} value={money(order.subtotalCents)} />
        {order.discountCents > 0 ? (
          <Row
            label="Discount"
            note={order.discountLabel ?? order.promotionCodeSnapshot ?? undefined}
            value={`−${money(order.discountCents)}`}
          />
        ) : null}
        {order.shippingCents > 0 ? <Row label="Shipping" value={money(order.shippingCents)} /> : null}
        {order.gstCents > 0 ? (
          <Row label={taxLabel(tax)} note={tax.inclusive ? "Included" : "Added"} value={money(order.gstCents)} />
        ) : null}
        <Row label="Total" value={money(order.totalCents)} strong />
        <div className="my-2 border-t border-[var(--line)]" />
        <Row
          label={depositOnly ? "Deposit paid" : "Paid"}
          note={orderPaymentLabel(order.paymentMethod, order.localTransferMethodId, order.paymentStatus)}
          value={money(paid)}
        />
        {depositOnly && order.balanceCents ? (
          <Row label="Balance due" value={money(order.balanceCents)} />
        ) : null}
        {refunded > 0 ? (
          <>
            <Row label="Refunded" value={`−${money(refunded)}`} />
            <Row label="Net payment" value={money(Math.max(0, paid - refunded))} strong />
          </>
        ) : null}
      </div>
      <OrderRefundSection order={order} />
    </DetailCard>
  );
}
