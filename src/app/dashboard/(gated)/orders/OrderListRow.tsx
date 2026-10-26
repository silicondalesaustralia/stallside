import DashListCard from "@/components/DashListCard";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { formatDateInTz } from "@/lib/stand-timezone";
import { isCountedPaymentStatus } from "@/lib/order-metrics";
import { orderChannelBadge } from "./order-channel-badge";
import { orderPaymentLabel, paymentStatusNote } from "@/lib/order-payment-label";
import OrderCustomerBadge from "./OrderCustomerBadge";
import OrderDeleteButton from "./OrderDeleteButton";
import OrderDeliveryLine, { type OrderDeliveryFields } from "./OrderDeliveryLine";
import OrderShippingPanel, { type OrderShippingFields } from "./OrderShippingPanel";
import PayPalRefundPanel from "./PayPalRefundPanel";
import { paypalTransactionUrl } from "@/lib/paypal-refunds";

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
  paypalCaptureId: string | null;
  refundedCents: number | null;
  customerName: string | null;
  customerPhone: string | null;
  receiptEmail: string | null;
  isPreOrder: boolean;
  shopperSubscriptionId: string | null;
  stand: { name: string };
  items: OrderItem[];
} & OrderDeliveryFields &
  OrderShippingFields;

export default function OrderListRow({
  order,
  timeZone,
}: {
  order: OrderRow;
  timeZone: string;
}) {
  const badge = orderChannelBadge(order);

  return (
    <li>
      <DashListCard>
        <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                {order.stand.name} ·{" "}
                {formatDateInTz(order.createdAt, timeZone, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
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
              {isCountedPaymentStatus(order.paymentStatus)
                ? orderPaymentLabel(
                    order.paymentMethod,
                    order.localTransferMethodId,
                  )
                : order.paymentMethod.toLowerCase()}{" "}
              · {paymentStatusNote(order.paymentStatus)}
            </p>
            <OrderCustomerBadge
              orderId={order.id}
              customerName={order.customerName}
              customerPhone={order.customerPhone}
              email={order.receiptEmail}
              defaultSubject={`${order.stand.name} · order ${order.orderNumber}`}
            />
            <OrderDeliveryLine order={order} />
            {order.paymentMethod === PaymentMethod.PAYPAL && order.paypalCaptureId ? (
              <PayPalRefundPanel
                orderId={order.id}
                refundUrl={paypalTransactionUrl(order.paypalCaptureId)}
                refundedCents={order.refundedCents}
                totalCents={order.totalCents}
                currency={order.currency}
              />
            ) : null}
            {order.handoverMode === "DELIVER" && isCountedPaymentStatus(order.paymentStatus) ? (
              <OrderShippingPanel order={order} />
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
            restoresStock={isCountedPaymentStatus(order.paymentStatus)}
          />
        </div>
      </DashListCard>
    </li>
  );
}
