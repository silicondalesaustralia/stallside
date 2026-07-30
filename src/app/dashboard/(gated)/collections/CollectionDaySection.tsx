import type { CollectionStatus } from "@/generated/prisma/client";
import CollectionStatusButton from "./CollectionStatusButton";
import CollectionDayEmailAll from "./CollectionDayEmailAll";
import OrderCustomerEmail from "./OrderCustomerEmail";

type CollectionOrder = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  receiptEmail: string | null;
  collectionNote: string | null;
  collectionStatus: CollectionStatus | null;
  stand: { name: string };
  items: {
    id: string;
    quantity: number;
    productNameSnapshot: string;
    optionsSnapshot: string | null;
  }[];
};

export default function CollectionDaySection({
  dayKey,
  label,
  itemCount,
  orders,
}: {
  dayKey: string;
  label: string;
  itemCount: number;
  orders: CollectionOrder[];
}) {
  const emailCount = orders.filter((o) => o.receiptEmail).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="border-b border-[var(--line)] pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">{label}</h2>
          <CollectionDayEmailAll
            collectionDayKey={dayKey}
            dayLabel={label}
            recipientCount={emailCount}
          />
        </div>
        <p className="text-sm text-[var(--muted)]">
          {orders.length} order{orders.length === 1 ? "" : "s"}, {itemCount}{" "}
          item{itemCount === 1 ? "" : "s"}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p className="font-semibold">
                {order.customerName ?? "Customer"}
              </p>
              {order.customerPhone ? (
                <p className="text-sm text-[var(--muted)]">
                  {order.customerPhone}
                </p>
              ) : null}
              {order.receiptEmail ? (
                <div className="mt-1">
                  <OrderCustomerEmail
                    orderId={order.id}
                    email={order.receiptEmail}
                    defaultSubject={`${order.stand.name} · order ${order.orderNumber}`}
                  />
                </div>
              ) : null}
              <p className="mt-1 text-sm text-[var(--muted)]">
                {order.stand.name} · {order.orderNumber}
              </p>
              <ul className="mt-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.productNameSnapshot}
                    {item.optionsSnapshot
                      ? ` (${item.optionsSnapshot})`
                      : ""}
                  </li>
                ))}
              </ul>
              {order.collectionNote ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {order.collectionNote}
                </p>
              ) : null}
            </div>
            <div className="print:hidden">
              <CollectionStatusButton
                orderId={order.id}
                status={order.collectionStatus ?? "ORDERED"}
              />
            </div>
            <p className="hidden text-sm font-medium print:block">
              {order.collectionStatus ?? "ORDERED"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
