import { formatMoney } from "@/lib/money";
import type { getSaasStats } from "@/lib/admin-saas-stats";
import type { LtvWindow } from "@/lib/admin-ltv-window";
import type { SaasSeriesPoint } from "@/lib/saas-series";
import DashboardStat from "@/components/DashboardStat";
import SaasSeriesChart from "@/components/SaasSeriesChart";
import SalesSeriesChart from "@/components/SalesSeriesChart";

type SaasStats = Awaited<ReturnType<typeof getSaasStats>>;

export default function AdminSaasPanels({
  windowLabel,
  saas,
  series,
  ltv,
  ltvPrev,
}: {
  windowLabel: string;
  saas: SaasStats;
  series: SaasSeriesPoint[];
  ltv: LtvWindow;
  ltvPrev: LtvWindow | null;
}) {
  return (
    <>
      <SalesSeriesChart
        points={ltv.points}
        previousPoints={ltvPrev?.points}
        currency={saas.currency}
        title={`${windowLabel} · LTV collected`}
      />
      <p className="-mt-6 text-sm text-[var(--muted)]">
        Fees {formatMoney(ltv.feeAudCents, saas.currency)}
        {ltv.feesFromStripe ? " (Stripe)" : ""} · Subscriptions{" "}
        {formatMoney(ltv.subscriptionAudCents, saas.currency)}
        {ltv.subscriptionsLoaded
          ? ""
          : " · subscription invoices could not be loaded"}
      </p>

      <SaasSeriesChart points={series} title={`${windowLabel} · SaaS activity`} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="MRR (AUD)"
          value={formatMoney(saas.mrrCents, saas.currency)}
        />
        <DashboardStat
          label="ARR (AUD)"
          value={formatMoney(saas.arrCents, saas.currency)}
        />
        <DashboardStat
          label="Fees all-time (AUD)"
          value={formatMoney(saas.feesAllTimeCents, saas.currency)}
        />
        <DashboardStat
          label="Paying subs"
          value={String(saas.liveSubscribers)}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label={`LTV · ${windowLabel}`}
          value={formatMoney(ltv.totalAudCents, saas.currency)}
          current={ltvPrev ? ltv.totalAudCents : undefined}
          previous={ltvPrev?.totalAudCents}
        />
        <DashboardStat
          label="LTV all-time (AUD)"
          value={formatMoney(saas.totalLtvCents, saas.currency)}
        />
        <DashboardStat label="Owners" value={String(saas.owners)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat label="Active" value={String(saas.active)} />
        <DashboardStat label="Stripe trialing" value={String(saas.trialing)} />
        <DashboardStat label="Past due" value={String(saas.pastDue)} />
        <DashboardStat label="Cancelled" value={String(saas.cancelled)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="Demo completions"
          value={String(saas.demoCompletions)}
        />
        <DashboardStat
          label="Demo last 7 days"
          value={String(saas.demoCompletions7d)}
        />
        <DashboardStat
          label="Demo stands"
          value={String(saas.demoStandCount)}
        />
      </section>
    </>
  );
}
