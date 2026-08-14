import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { shouldChargeVendlFee } from "@/lib/stallside-fee";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      stand: true,
      owner: {
        include: {
          user: { select: { email: true, role: true } },
        },
      },
      items: true,
    },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-[var(--muted)]">Latest sales across all stands.</p>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No orders yet.</p>
      ) : (
        <ul className="dash-card divide-y divide-[var(--line)] px-5">
          {orders.map((order) => {
            // Free only; Pro / lifetime / platform-admin complimentary → $0.
            const feeCents = shouldChargeVendlFee(order.owner, {
              email: order.owner.user.email,
              role: order.owner.user.role,
            })
              ? order.platformFeeCents
              : 0;
            return (
              <li key={order.id} className="py-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {order.orderNumber} · {order.stand.name}
                  </p>
                  <p>{formatMoney(order.totalCents, order.currency)}</p>
                </div>
                <p className="mt-1 text-[var(--muted)]">
                  {order.createdAt.toLocaleString()} · {order.owner.businessName}{" "}
                  · {order.paymentMethod.toLowerCase()} ·{" "}
                  {order.paymentStatus.toLowerCase()}
                  {feeCents > 0
                    ? ` · fee ${formatMoney(feeCents, order.currency)}`
                    : ""}
                </p>
                <p className="mt-2 text-[var(--muted)]">
                  {order.items
                    .map(
                      (item) =>
                        `${item.quantity}× ${item.productNameSnapshot}${
                          item.optionsSnapshot
                            ? ` (${item.optionsSnapshot})`
                            : ""
                        }`,
                    )
                    .join(", ")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
