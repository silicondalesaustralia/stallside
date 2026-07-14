import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import DashboardStat from "@/components/DashboardStat";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const { owner } = await requireOwner();
  const since = startOfToday();

  const [standRows, products, todayOrders, catalog, recent] = await Promise.all([
    prisma.stand.findMany({
      where: { ownerId: owner.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.count({ where: { ownerId: owner.id, isActive: true } }),
    prisma.order.findMany({
      where: {
        ownerId: owner.id,
        createdAt: { gte: since },
        paymentStatus: {
          in: [PaymentStatus.PAID, PaymentStatus.CUSTOMER_CONFIRMED],
        },
      },
    }),
    prisma.product.findMany({
      where: { ownerId: owner.id, isActive: true },
      include: { stand: true },
      orderBy: { stockQuantity: "asc" },
    }),
    prisma.order.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { stand: true },
    }),
  ]);

  const stands = standRows.length;
  const lowStock = catalog
    .filter((p) => p.stockQuantity <= p.lowStockThreshold)
    .slice(0, 8);
  const cashTotal = todayOrders
    .filter((o) => o.paymentMethod === PaymentMethod.CASH)
    .reduce((sum, o) => sum + o.totalCents, 0);
  const cardTotal = todayOrders
    .filter((o) => o.paymentMethod === PaymentMethod.CARD)
    .reduce((sum, o) => sum + o.totalCents, 0);
  const currency = todayOrders[0]?.currency ?? "AUD";

  return (
    <main className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
            {owner.businessName}
          </h1>
          <p className="mt-1 text-[var(--muted)]">Today&apos;s stand activity</p>
        </div>
        <Link
          href="/dashboard/stands/new"
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          New stand
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat label="Today sales" value={formatMoney(cashTotal + cardTotal, currency)} />
        <DashboardStat label="Cash" value={formatMoney(cashTotal, currency)} />
        <DashboardStat label="Card" value={formatMoney(cardTotal, currency)} />
        <DashboardStat label="Orders" value={String(todayOrders.length)} />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Snapshot</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {stands} stand{stands === 1 ? "" : "s"} · {products} active product
            {products === 1 ? "" : "s"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Stripe:{" "}
            {owner.stripeChargesEnabled
              ? "Connected"
              : "Not connected - card checkout disabled"}
          </p>
          {standRows.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {standRows.map((stand) => (
                <li key={stand.id}>
                  <Link
                    href={`/dashboard/stands/${stand.id}/qr`}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-4 text-sm font-semibold transition hover:border-[var(--leaf)]"
                  >
                    <span>{stand.name}</span>
                    <span className="text-[var(--leaf-dark)]">QR &amp; print →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Low stock</h2>
          {lowStock.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">Nothing low right now.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between gap-4">
                  <span>
                    {p.name}{" "}
                    <span className="text-[var(--muted)]">({p.stand.name})</span>
                  </span>
                  <span className="font-receipt font-medium text-[var(--warn)]">
                    {p.stockQuantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent sales</h2>
          <Link href="/dashboard/orders" className="text-sm text-[var(--leaf-dark)] underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No sales yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {recent.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <span>
                  {order.orderNumber} · {order.stand.name}
                </span>
                <span className="font-receipt text-[var(--muted)]">
                  {order.paymentMethod.toLowerCase()} ·{" "}
                  {formatMoney(order.totalCents, order.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
