import { redirect } from "next/navigation";
import { PaymentStatus } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { formatCollectionLabel } from "@/lib/pre-order";
import CollectionStatusButton from "./CollectionStatusButton";
import CollectionsPrintButton from "./CollectionsPrintButton";
import OrderCustomerEmail from "./OrderCustomerEmail";

export default async function CollectionsPage() {
  const { owner, user } = await requireOwner();
  if (
    !ownerHasCardTierAccess(owner, { email: user.email, role: user.role })
  ) {
    redirect("/dashboard/orders");
  }

  const orders = await prisma.order.findMany({
    where: {
      ownerId: owner.id,
      isPreOrder: true,
      paymentStatus: PaymentStatus.PAID,
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
      label: string;
      orders: typeof orders;
      itemCount: number;
    }
  >();

  for (const order of orders) {
    const at = order.collectionAt!;
    const key = at.toISOString().slice(0, 10);
    const existing = groups.get(key);
    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
    if (existing) {
      existing.orders.push(order);
      existing.itemCount += itemCount;
    } else {
      groups.set(key, {
        label: formatCollectionLabel(at),
        orders: [order],
        itemCount,
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
            Who&apos;s collecting what, by date.
          </p>
        </div>
        {days.length > 0 ? <CollectionsPrintButton /> : null}
      </div>

      {days.length === 0 ? (
        <p className="text-[var(--muted)]">No paid pre-orders yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {days.map((day) => (
            <section key={day.label} className="flex flex-col gap-4">
              <div className="border-b border-[var(--line)] pb-2">
                <h2 className="text-xl font-semibold">{day.label}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {day.orders.length} order
                  {day.orders.length === 1 ? "" : "s"}, {day.itemCount} item
                  {day.itemCount === 1 ? "" : "s"}
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {day.orders.map((order) => (
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
          ))}
        </div>
      )}
    </main>
  );
}
