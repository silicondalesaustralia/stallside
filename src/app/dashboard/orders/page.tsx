import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export default async function OrdersPage() {
  const { owner } = await requireOwner();
  const orders = await prisma.order.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { stand: true, items: true },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-[var(--muted)]">Cash and card sales logged at your stands.</p>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {orders.map((order) => (
            <li key={order.id} className="py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {order.orderNumber} · {order.stand.name}
                </p>
                <p>{formatMoney(order.totalCents, order.currency)}</p>
              </div>
              <p className="mt-1 text-[var(--muted)]">
                {order.createdAt.toLocaleString()} · {order.paymentMethod.toLowerCase()} ·{" "}
                {order.paymentStatus.toLowerCase()}
                {order.receiptEmail ? ` · ${order.receiptEmail}` : ""}
              </p>
              <p className="mt-2 text-[var(--muted)]">
                {order.items
                  .map((item) => `${item.quantity}× ${item.productNameSnapshot}`)
                  .join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
