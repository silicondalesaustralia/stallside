import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { secondaryButtonClass } from "@/components/dashboard/ui/button-styles";
import { loadOwnerOrderDetail } from "@/lib/orders/load-order-detail";
import { orderNeighbours } from "@/lib/orders/order-neighbours";
import {
  orderChannelLabel,
  orderFulfilmentPill,
  orderPaymentPill,
} from "@/lib/orders/order-status";
import { isCountedPaymentStatus } from "@/lib/order-metrics";
import { formatDateInTz, resolveStandTimezone } from "@/lib/stand-timezone";
import OrderDeleteButton from "../OrderDeleteButton";
import OrderItemsCard from "./OrderItemsCard";
import OrderPaymentCard from "./OrderPaymentCard";
import { taxConfig } from "@/lib/tax/config";
import OrderTimelineCard from "./OrderTimelineCard";
import OrderCustomerCard from "./OrderCustomerCard";
import OrderHandoverCard from "./OrderHandoverCard";
import OrderInfoCard from "./OrderInfoCard";
import OrderPagerLinks from "./OrderPagerLinks";

export const dynamic = "force-dynamic";

const ONLINE_METHODS = ["CARD", "SQUARE", "PAYPAL"];

export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const { owner } = await requireOwner();
  const order = await loadOwnerOrderDetail(owner.id, orderId.trim());
  if (!order) notFound();

  const timeZone = resolveStandTimezone(order.stand.timezone);
  const { newerId, olderId } = await orderNeighbours(order);
  const fulfilment = orderFulfilmentPill(order);
  const counted = isCountedPaymentStatus(order.paymentStatus);
  const canRefund = counted && ONLINE_METHODS.includes(order.paymentMethod);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader
        backHref="/dashboard/orders"
        backLabel="Orders"
        title={`#${order.orderNumber}`}
        badges={
          <>
            <StatusPill {...orderPaymentPill(order)} />
            {fulfilment ? <StatusPill {...fulfilment} /> : null}
          </>
        }
        subtitle={`${formatDateInTz(order.createdAt, timeZone, {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })} · from ${orderChannelLabel(order)}`}
        actions={
          <>
            {canRefund ? (
              <a href="#payment" className={secondaryButtonClass}>
                Refund
              </a>
            ) : null}
            <OrderDeleteButton
              orderId={order.id}
              orderNumber={order.orderNumber}
              restoresStock={counted}
              redirectTo="/dashboard/orders"
            />
            <OrderPagerLinks newerId={newerId} olderId={olderId} />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <OrderItemsCard order={order} />
          <div id="payment" className="scroll-mt-24">
            <OrderPaymentCard order={order} tax={taxConfig(owner, order.currency)} />
          </div>
          <OrderTimelineCard order={order} timeZone={timeZone} />
        </div>
        <aside className="flex flex-col gap-5">
          <OrderCustomerCard order={order} />
          <OrderHandoverCard order={order} timeZone={timeZone} />
          <OrderInfoCard order={order} />
        </aside>
      </div>
    </main>
  );
}
