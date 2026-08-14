import DashListCard from "@/components/DashListCard";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { orderPaymentLabel, paymentStatusNote } from "@/lib/order-payment-label";
import OrderCustomerEmail from "../collections/OrderCustomerEmail";
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
  stand: { name: string };
  items: OrderItem[];
};

export default function OrderListRow({ order }: { order: OrderRow }) {
  return (
    <li>
      <DashListCard>
        <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              {order.stand.name} · {order.createdAt.toLocaleString()}
            </p>
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
              {order.customerName ? ` · ${order.customerName}` : ""}
              {order.customerPhone ? ` · ${order.customerPhone}` : ""}
            </p>
            {order.receiptEmail ? (
              <div className="mt-2">
                <OrderCustomerEmail
                  orderId={order.id}
                  email={order.receiptEmail}
                  defaultSubject={`${order.stand.name} · order ${order.orderNumber}`}
                />
              </div>
            ) : null}
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
            restoresStock={COUNTED_STATUSES.includes(order.paymentStatus)}
          />
        </div>
      </DashListCard>
    </li>
  );
}
