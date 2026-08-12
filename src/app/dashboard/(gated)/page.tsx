import Link from "next/link";
import { requireOwner } from "@/lib/session";
import DashboardHomeStats from "@/components/DashboardHomeStats";
import DashboardPanels from "@/components/DashboardPanels";
import DateRangeFilter from "@/components/DateRangeFilter";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import StarterUpgradeSignals from "@/components/StarterUpgradeSignals";
import TapAndGoSetupCard from "@/components/TapAndGoSetupCard";
import NoBusinessYet from "@/components/NoBusinessYet";
import PreOrdersCrossSellBanner from "./PreOrdersCrossSellBanner";
import { resolveDateWindow } from "@/lib/date-range";
import { summarizeOrders } from "@/lib/order-metrics";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { buildSalesSeries } from "@/lib/sales-series";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadDashboardHomeData } from "./load-dashboard-home";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const cardTier = ownerHasProAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const params = await searchParams;
  const window = resolveDateWindow(params);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
            {owner.businessName}
          </h1>
        </div>
        <NoBusinessYet />
      </main>
    );
  }

  const data = await loadDashboardHomeData({
    ownerId: owner.id,
    standId: selected.id,
    window,
    monthStart,
    loadUpgradeSignals: !cardTier,
  });

  const current = summarizeOrders(data.currentOrders);
  const previous = summarizeOrders(data.previousOrders);
  const series = buildSalesSeries(data.currentOrders, window.start, window.end);
  const previousSeries = buildSalesSeries(
    data.previousOrders,
    window.prevStart,
    window.prevEnd,
  );
  const standName = selected.name;
  const lowStock = data.lowStockRows.map((p) => ({
    id: p.id,
    name: p.name,
    stockQuantity: Number(p.stockQuantity),
    stand: { name: standName },
  }));
  const recent = data.recent.map((order) => ({
    ...order,
    stand: { name: standName },
  }));
  const showPreOrdersCrossSell =
    !owner.preOrdersCrossSellDismissedAt &&
    !data.hasPreOrderProduct &&
    data.soldOutTakeNow >= 1;
  const ordersHref = `/dashboard/orders?range=${window.key}${
    window.key === "custom"
      ? `&from=${window.fromParam}&to=${window.toParam}`
      : ""
  }`;

  return (
    <main className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
            {selected.name}
          </h1>
          <p className="mt-1 text-[var(--muted)]">{window.label} activity</p>
        </div>
        <Link
          href={`/dashboard/businesses/${selected.id}`}
          className="rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
        >
          Business setup
        </Link>
      </div>

      {showPreOrdersCrossSell ? <PreOrdersCrossSellBanner /> : null}
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

      {!cardTier ? (
        <StarterUpgradeSignals
          cardInterestCount={data.cardInterests.length}
          cardInterestCents={data.cardInterests.reduce(
            (s, r) => s + r.subtotalCents,
            0,
          )}
          currency={data.cardInterests[0]?.currency ?? current.currency}
          restockSubscriberCount={data.restockSubscriberCount}
        />
      ) : null}

      <DashboardHomeStats current={current} previous={previous} />

      <SalesSeriesChart
        points={series}
        previousPoints={previousSeries}
        currency={current.currency}
        title={`${window.label} vs prior period`}
      />

      <DashboardPanels
        stands={1}
        products={data.products}
        stripeConnected={owner.stripeChargesEnabled}
        standRows={[{ id: selected.id, name: selected.name }]}
        lowStock={lowStock}
        recent={recent}
        ordersHref={ordersHref}
      />
    </main>
  );
}
