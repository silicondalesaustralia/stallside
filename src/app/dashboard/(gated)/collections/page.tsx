import { HandoverMode } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { formatCollectionLabel } from "@/lib/pre-order";
import { formatMoney } from "@/lib/money";
import CollectionDaySection from "./CollectionDaySection";
import CollectionsPrintButton from "./CollectionsPrintButton";
import MakeListSection from "./MakeListSection";
import OrderLabelsPrint from "./OrderLabelsPrint";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import {
  dayMakeListMeta,
  groupCollectionDays,
  loadCollectionOrders,
} from "./load-collections";

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

  const orders = await loadCollectionOrders(owner.id, selected.id);
  const days = groupCollectionDays(orders);

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
        <p className="text-[var(--muted)]">
          No paid pre-orders upcoming or in the last 14 days.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {days.map((day) => {
            const { skus, suburbs } = dayMakeListMeta(day.orders);
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
