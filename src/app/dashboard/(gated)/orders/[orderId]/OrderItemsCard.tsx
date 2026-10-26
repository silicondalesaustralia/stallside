/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import DetailCard from "@/components/dashboard/ui/DetailCard";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { formatMoney } from "@/lib/money";
import { orderFulfilmentPill } from "@/lib/orders/order-status";
import type { OrderDetail } from "@/lib/orders/load-order-detail";
import CollectionStatusButton from "../../collections/CollectionStatusButton";
import OrderShippingPanel from "../OrderShippingPanel";
import { isCountedPaymentStatus } from "@/lib/order-metrics";

export default function OrderItemsCard({ order }: { order: OrderDetail }) {
  const pill = orderFulfilmentPill(order) ?? { label: "Not paid", tone: "warning" as const };
  const paid = isCountedPaymentStatus(order.paymentStatus);

  return (
    <DetailCard
      badge={<StatusPill {...pill} />}
      action={
        order.isPreOrder && order.collectionStatus && paid ? (
          <CollectionStatusButton orderId={order.id} status={order.collectionStatus} />
        ) : null
      }
    >
      <ul className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-3 py-3 text-sm">
            <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--wash)]">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/products/${item.productId}`}
                className="font-semibold hover:underline"
              >
                {item.productNameSnapshot}
              </Link>
              {item.optionsSnapshot ? (
                <p className="text-xs text-[var(--muted)]">{item.optionsSnapshot}</p>
              ) : null}
              {item.product.sku ? (
                <p className="text-xs text-[var(--muted)]">SKU {item.product.sku}</p>
              ) : null}
            </div>
            <p className="font-receipt whitespace-nowrap text-[var(--muted)]">
              {formatMoney(item.unitPriceCents, order.currency)} × {item.quantity}
            </p>
            <p className="font-receipt w-20 whitespace-nowrap text-right">
              {formatMoney(item.lineTotalCents, order.currency)}
            </p>
          </li>
        ))}
      </ul>
      {order.handoverMode === "DELIVER" && paid ? <OrderShippingPanel order={order} /> : null}
    </DetailCard>
  );
}
