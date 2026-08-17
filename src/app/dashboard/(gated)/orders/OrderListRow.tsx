import DashListCard from "@/components/DashListCard";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { COUNTED_STATUSES, isCountedPaymentStatus } from "@/lib/order-metrics";
import { orderPaymentLabel, paymentStatusNote } from "@/lib/order-payment-label";
import OrderCustomerBadge from "./OrderCustomerBadge";
import OrderDeleteButton from "./OrderDeleteButton";

type OrderItem = {
  quantity: number;
  productNameSnapshot: string;
  optionsSnapshot: string | null;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  paymentMethod: PaymentMethod;
  localTransferMethodId: string | null;
  paymentStatus: PaymentStatus;
  customerName: string | null;
  customerPhone: string | null;
  receiptEmail: string | null;
  isPreOrder: boolean;
  shopperSubscriptionId: string | null;
  stand: { name: string };
  items: OrderItem[];
};

function channelBadge(order: OrderRow): {
  label: string;
  className: string;
} {
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

export default function OrderListRow({ order }: { order: OrderRow }) {
  const badge = channelBadge(order);

  return (
    <li>
      <DashListCard>
        <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                {order.stand.name} · {order.createdAt.toLocaleString()}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold leading-tight">
              {order.orderNumber}
              <span className="ml-2 font-receipt text-base font-semibold">
                {formatMoney(order.totalCents, order.currency)}
              </span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {orderPaymentLabel(
                order.paymentMethod,
                order.localTransferMethodId,
              )}{" "}
              · {paymentStatusNote(order.paymentStatus)}
            </p>
            <OrderCustomerBadge
              orderId={order.id}
              customerName={order.customerName}
              customerPhone={order.customerPhone}
              email={order.receiptEmail}
              defaultSubject={`${order.stand.name} · order ${order.orderNumber}`}
            />
            <p className="mt-2 text-sm text-[var(--muted)]">
              {order.items
                .map(
                  (item) =>
                    `${item.quantity}× ${item.productNameSnapshot}${
                      item.optionsSnapshot ? ` (${item.optionsSnapshot})` : ""
                    }`,
                )
                .join(", ")}
            </p>
          </div>
          <OrderDeleteButton
            orderId={order.id}
            orderNumber={order.orderNumber}
            restoresStock={isCountedPaymentStatus(order.paymentStatus)}
          />
        </div>
      </DashListCard>
    </li>
  );
}
