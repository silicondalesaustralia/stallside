import Link from "next/link";
import { requireOwner } from "@/lib/session";
import DashboardChannelCard from "@/components/DashboardChannelCard";
import DashboardGreeting from "@/components/DashboardGreeting";
import DashboardLowStockCard from "@/components/DashboardLowStockCard";
import DashboardPanels from "@/components/DashboardPanels";
import DateRangeFilter from "@/components/DateRangeFilter";
import ProEconomicsCard from "@/components/ProEconomicsCard";
import SalesAnalyticsPanel from "@/components/SalesAnalyticsPanel";
import SetupProgressCard from "@/components/SetupProgressCard";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveDateWindow } from "@/lib/date-range";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadDashboardHomeData } from "./load-dashboard-home";
import { loadSetupProgress } from "@/lib/load-setup-progress";
import { loadVendlFeeEconomics } from "@/lib/vendl-fee-economics";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const { businesses, selected } = await resolveSelectedBusiness(owner.id);
  const access = { email: user.email, role: user.role };
  const cardTier = ownerHasProAccess(owner, access);
  const params = await searchParams;
  const window = resolveDateWindow(params);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [setupProgress, feeEconomics] = await Promise.all([
    loadSetupProgress({
      ownerId: owner.id,
      selectedStandId: selected?.id ?? null,
      standSlug: selected?.slug ?? null,
      standCount: businesses.length,
      stripeChargesEnabled: owner.stripeChargesEnabled,
      emailAlertsEnabled: owner.emailAlertsEnabled,
      pushAlertsEnabled: owner.pushAlertsEnabled,
    }),
    loadVendlFeeEconomics({ ownerId: owner.id, owner, access }),
  ]);

  if (!selected) {
    return (
      <main className="flex flex-col gap-6">
        <DashboardGreeting standName={owner.businessName} />
        <SetupProgressCard
          tasks={setupProgress.tasks}
          summary={setupProgress.summary}
        />
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

  const current = data.currentSummaries.all;
  const standName = selected.name;
  const lowStock = data.lowStockRows.map((p) => ({
    id: p.id,
    name: p.name,
    stockQuantity: Number(p.stockQuantity),
  }));
  const recent = data.recent.map((order) => ({
    ...order,
    stand: { name: standName },
  }));
  const ordersHref = `/dashboard/orders?range=${window.key}${
    window.key === "custom"
      ? `&from=${window.fromParam}&to=${window.toParam}`
      : ""
  }`;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <DashboardGreeting standName={standName} />
        <DateRangeFilter
          pathname="/dashboard"
          activeKey={window.key}
          from={window.fromParam}
          to={window.toParam}
        />
      </div>

      <SalesAnalyticsPanel
        channels={data.channels}
        previousPoints={data.previousPoints}
        currentSummaries={data.currentSummaries}
        previousSummaries={data.previousSummaries}
        chartTitle={`${window.label} vs prior`}
        ordersHref={ordersHref}
        layout="home"
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <SetupProgressCard
          tasks={setupProgress.tasks}
          summary={setupProgress.summary}
        />
        <DashboardLowStockCard items={lowStock} />
      </div>

      {feeEconomics ? <ProEconomicsCard economics={feeEconomics} /> : null}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <DashboardChannelCard
          title="Pre-orders"
          count={data.preOrderPageCount}
          unit={data.preOrderPageCount === 1 ? "page" : "pages"}
          empty="No pre-order pages yet. Share a link for collection day."
          href="/dashboard/pre-order-pages"
          ctaHref="/dashboard/pre-order-pages/new"
          cta="+ New pre-order page"
        />
        <DashboardChannelCard
          title="Subscriptions"
          count={data.subscriptionOfferCount}
          unit={
            data.subscriptionOfferCount === 1 ? "offer" : "offers"
          }
          empty="No subscription offers yet. Recurring boxes on card."
          detail={
            data.activeShopperSubs === 1
              ? "1 live box"
              : `${data.activeShopperSubs} live boxes`
          }
          href="/dashboard/subscriptions"
          ctaHref="/dashboard/subscriptions/new"
          cta="+ New subscription"
        />
      </div>

      <DashboardPanels
        stands={1}
        products={data.products}
        stripeConnected={owner.stripeChargesEnabled}
        standRows={[{ id: selected.id, name: selected.name }]}
        recent={recent}
        ordersHref={ordersHref}
      />

      <Link
        href={`/dashboard/businesses/${selected.id}`}
        className="self-start text-sm font-semibold text-[var(--muted)] underline hover:text-[var(--ink)]"
      >
        Business setup
      </Link>
    </main>
  );
}
