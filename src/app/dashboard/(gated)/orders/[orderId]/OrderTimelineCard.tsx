import DetailCard from "@/components/dashboard/ui/DetailCard";
import { formatDateInTz } from "@/lib/stand-timezone";
import { formatMoney } from "@/lib/money";
import type { OrderDetail } from "@/lib/orders/load-order-detail";

type Event = { at: Date | null; text: string };

function events(order: OrderDetail): Event[] {
  const money = (cents: number) => formatMoney(cents, order.currency);
  const list: Event[] = [
    { at: order.createdAt, text: `${order.customerName ?? "Customer"} placed this order` },
  ];
  if (order.collectionAt) list.push({ at: order.collectionAt, text: "Collection date" });
  if (order.shippedAt) {
    list.push({
      at: order.shippedAt,
      text: `Shipped${order.shippingCarrier ? ` with ${order.shippingCarrier}` : ""}${
        order.trackingNumber ? ` · ${order.trackingNumber}` : ""
      }`,
    });
  }
  if (order.deliveredAt) list.push({ at: order.deliveredAt, text: "Delivered" });
  if (order.refundedCents || order.paymentStatus === "REFUNDED") {
    list.push({
      at: null,
      text:
        order.paymentStatus === "REFUNDED"
          ? `Refunded ${money(order.refundedCents ?? order.totalCents)}`
          : `Partially refunded ${money(order.refundedCents ?? 0)}`,
    });
  }
  return list;
}

/** Key moments in the order's life, newest first. */
export default function OrderTimelineCard({ order, timeZone }: { order: OrderDetail; timeZone: string }) {
  const list = events(order)
    .map((e, i) => ({ ...e, i }))
    .sort((a, b) => (b.at?.getTime() ?? Infinity) - (a.at?.getTime() ?? Infinity) || b.i - a.i);

  return (
    <DetailCard title="Timeline">
      <ol className="relative ml-1.5 border-l border-[var(--line)] text-sm">
        {list.map((e) => (
          <li key={`${e.i}-${e.text}`} className="relative flex flex-wrap justify-between gap-x-4 pb-4 pl-5 last:pb-0">
            <span aria-hidden className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-[var(--field)]" />
            <span>{e.text}</span>
            {e.at ? (
              <span className="text-xs text-[var(--muted)]">
                {formatDateInTz(e.at, timeZone, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </DetailCard>
  );
}
