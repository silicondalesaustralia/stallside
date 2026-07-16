import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import DashboardStat from "@/components/DashboardStat";
import DashboardPanels from "@/components/DashboardPanels";
import DateRangeFilter from "@/components/DateRangeFilter";
import TapAndGoSetupCard from "@/components/TapAndGoSetupCard";
import { resolveDateWindow } from "@/lib/date-range";
import { COUNTED_STATUSES, summarizeOrders } from "@/lib/order-metrics";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const params = await searchParams;
  const window = resolveDateWindow(params);

  const [standRows, products, currentOrders, previousOrders, catalog, recent] =
    await Promise.all([
      prisma.stand.findMany({
        where: { ownerId: owner.id },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.product.count({ where: { ownerId: owner.id, isActive: true } }),
      prisma.order.findMany({
        where: {
          ownerId: owner.id,
          createdAt: { gte: window.start, lte: window.end },
          paymentStatus: { in: COUNTED_STATUSES },
        },
        select: {
          totalCents: true,
          paymentMethod: true,
          currency: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: {
          ownerId: owner.id,
          createdAt: { gte: window.prevStart, lte: window.prevEnd },
          paymentStatus: { in: COUNTED_STATUSES },
        },
        select: {
          totalCents: true,
          paymentMethod: true,
          currency: true,
          createdAt: true,
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

  const current = summarizeOrders(currentOrders);
  const previous = summarizeOrders(previousOrders);
  const lowStock = catalog
    .filter((p) => p.stockQuantity <= p.lowStockThreshold)
    .slice(0, 8);
  const ordersHref = `/dashboard/orders?range=${window.key}${
    window.key === "custom" ? `&from=${window.fromParam}&to=${window.toParam}` : ""
  }`;

  return (
    <main className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
            {owner.businessName}
          </h1>
          <p className="mt-1 text-[var(--muted)]">{window.label} stand activity</p>
        </div>
        <Link
          href="/dashboard/stands/new"
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          New stand
        </Link>
      </div>

      <DateRangeFilter
        pathname="/dashboard"
        activeKey={window.key}
        from={window.fromParam}
        to={window.toParam}
      />

      <TapAndGoSetupCard
        cardTier={cardTier}
        stripeConnected={owner.stripeChargesEnabled}
        stripeStarted={Boolean(owner.stripeAccountId)}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="Sales"
          value={formatMoney(current.salesCents, current.currency)}
          current={current.salesCents}
          previous={previous.salesCents}
        />
        <DashboardStat
          label="Cash / PayID"
          value={formatMoney(current.cashCents, current.currency)}
          current={current.cashCents}
          previous={previous.cashCents}
        />
        <DashboardStat
          label="Card / PayPal"
          value={formatMoney(current.digitalCents, current.currency)}
          current={current.digitalCents}
          previous={previous.digitalCents}
        />
        <DashboardStat
          label="Orders"
          value={String(current.orderCount)}
          current={current.orderCount}
          previous={previous.orderCount}
        />
      </section>

      <DashboardPanels
        stands={standRows.length}
        products={products}
        stripeConnected={owner.stripeChargesEnabled}
        standRows={standRows}
        lowStock={lowStock}
        recent={recent}
        ordersHref={ordersHref}
      />
    </main>
  );
}
