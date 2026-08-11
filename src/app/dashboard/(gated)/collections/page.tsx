import {
  HandoverMode,
  PaymentStatus,
  PaymentTiming,
} from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCollectionLabel } from "@/lib/pre-order";
import { formatMoney } from "@/lib/money";
import CollectionDaySection from "./CollectionDaySection";
import CollectionsPrintButton from "./CollectionsPrintButton";
import MakeListSection from "./MakeListSection";
import OrderLabelsPrint from "./OrderLabelsPrint";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";

const COLLECTION_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

export default async function CollectionsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
        </div>
        <NoBusinessYet />
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      ownerId: owner.id,
      standId: selected.id,
      isPreOrder: true,
      paymentStatus: { in: COLLECTION_PAYMENT_STATUSES },
      collectionAt: { not: null },
    },
    orderBy: [{ collectionAt: "asc" }, { createdAt: "asc" }],
    include: {
      items: true,
      stand: { select: { name: true } },
    },
  });

  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      orders: typeof orders;
      itemCount: number;
      takenCents: number;
      currency: string;
      windowClosed: boolean;
    }
  >();

  for (const order of orders) {
    const at = order.collectionAt!;
    const key = at.toISOString().slice(0, 10);
    const existing = groups.get(key);
    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
    const taken =
      order.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE &&
      order.paymentStatus !== PaymentStatus.PAID
        ? (order.depositCents ?? 0)
        : order.totalCents;
    if (existing) {
      existing.orders.push(order);
      existing.itemCount += itemCount;
      existing.takenCents += taken;
    } else {
      groups.set(key, {
        key,
        label: formatCollectionLabel(at),
        orders: [order],
        itemCount,
        takenCents: taken,
        currency: order.currency,
        windowClosed: at.getTime() <= Date.now(),
      });
    }
  }

  const days = [...groups.values()];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
          <p className="mt-1 text-[var(--muted)] print:hidden">
            {selected.name} - make list first, then pack by customer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {days.length > 0 ? <CollectionsPrintButton /> : null}
          {days.length > 0 ? <OrderLabelsPrint /> : null}
        </div>
      </div>

      {days.length === 0 ? (
        <p className="text-[var(--muted)]">No paid pre-orders yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {days.map((day) => {
            const skuMap = new Map<string, number>();
            const suburbMap = new Map<string, number>();
            for (const order of day.orders) {
              for (const item of order.items) {
                const name = item.optionsSnapshot
                  ? `${item.productNameSnapshot} (${item.optionsSnapshot})`
                  : item.productNameSnapshot;
                skuMap.set(name, (skuMap.get(name) ?? 0) + item.quantity);
              }
              if (order.handoverMode === HandoverMode.DELIVER) {
                const suburb = order.deliverySuburb?.trim() || "Unknown";
                suburbMap.set(suburb, (suburbMap.get(suburb) ?? 0) + 1);
              }
            }
            const skus = [...skuMap.entries()]
              .map(([name, qty]) => ({ name, qty }))
              .sort((a, b) => a.name.localeCompare(b.name));
            const suburbs = [...suburbMap.entries()]
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => a.name.localeCompare(b.name));

            return (
              <div key={day.key} className="flex flex-col gap-6">
                <MakeListSection
                  label={day.label}
                  orderCount={day.orders.length}
                  takenLabel={formatMoney(day.takenCents, day.currency)}
                  windowClosed={day.windowClosed}
                  skus={skus}
                  suburbs={suburbs}
                />
                <CollectionDaySection
                  dayKey={day.key}
                  label={`Pack · ${day.label}`}
                  orders={day.orders}
                  itemCount={day.itemCount}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="hidden print:block" id="order-labels">
        {orders.map((order) => (
          <div
            key={order.id}
            className="mb-4 break-inside-avoid border border-black p-4 text-sm"
          >
            <p className="font-bold">{order.customerName ?? "Customer"}</p>
            <p>
              {order.handoverMode === HandoverMode.DELIVER
                ? "Delivery"
                : "Collect"}{" "}
              {order.collectionAt
                ? formatCollectionLabel(order.collectionAt)
                : ""}
            </p>
            {order.handoverMode === HandoverMode.DELIVER ? (
              <p>
                {[
                  order.deliveryAddressLine1,
                  order.deliverySuburb,
                  order.deliveryPostcode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
            <ul className="mt-2">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}× {item.productNameSnapshot}
                  {item.optionsSnapshot ? ` (${item.optionsSnapshot})` : ""}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">{order.orderNumber}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
