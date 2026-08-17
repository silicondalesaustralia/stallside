import Link from "next/link";
import { requireOwner } from "@/lib/session";
import DashboardChannelCard from "@/components/DashboardChannelCard";
import DashboardGreeting from "@/components/DashboardGreeting";
import DashboardLowStockCard from "@/components/DashboardLowStockCard";
import DashboardNextCard from "@/components/DashboardNextCard";
import DashboardPanels from "@/components/DashboardPanels";
import DateRangeFilter from "@/components/DateRangeFilter";
import SalesAnalyticsPanel from "@/components/SalesAnalyticsPanel";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveDateWindow } from "@/lib/date-range";
import { summarizeOrders } from "@/lib/order-metrics";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadDashboardHomeData } from "./load-dashboard-home";
import type { PaymentMethod } from "@/generated/prisma/client";

function serializeOrders(
  orders: {
    totalCents: number;
    paymentMethod: PaymentMethod;
    currency: string;
    createdAt: Date;
    isPreOrder: boolean;
    shopperSubscriptionId: string | null;
  }[],
) {
  return orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));
}

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
        <DashboardGreeting standName={owner.businessName} />
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
  const showPreOrdersCrossSell =
    !owner.preOrdersCrossSellDismissedAt &&
    !data.hasPreOrderProduct &&
    data.soldOutTakeNow >= 1;
  const ordersHref = `/dashboard/orders?range=${window.key}${
    window.key === "custom"
      ? `&from=${window.fromParam}&to=${window.toParam}`
      : ""
  }`;
  const cardInterestCount = data.cardInterests.length;
  const restockN = data.restockSubscriberCount;
  const upgradeLabel =
    !cardTier && cardInterestCount > 0
      ? "Card demand this month"
      : !cardTier && restockN > 0
        ? "Restock list growing"
        : null;

  return (
    <main className="flex flex-col gap-5">
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
        currentOrders={serializeOrders(data.currentOrders)}
        previousOrders={serializeOrders(data.previousOrders)}
        rangeStart={window.start.toISOString()}
        rangeEnd={window.end.toISOString()}
        prevStart={window.prevStart.toISOString()}
        prevEnd={window.prevEnd.toISOString()}
        chartTitle={`${window.label} vs prior`}
        ordersHref={ordersHref}
        layout="home"
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <DashboardNextCard
          stripeConnected={owner.stripeChargesEnabled}
          stripeStarted={Boolean(owner.stripeAccountId)}
          products={data.products}
          orderCount={current.orderCount}
          showPreOrders={showPreOrdersCrossSell}
          upgradeHref={upgradeLabel ? "/dashboard/settings/billing" : null}
          upgradeLabel={upgradeLabel}
          qrHref={`/dashboard/businesses/${selected.id}/qr`}
        />
        <DashboardLowStockCard items={lowStock} />
      </div>

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
