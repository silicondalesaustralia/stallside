import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import { getSaasStats } from "@/lib/admin-saas-stats";
import { getSaasSeries } from "@/lib/admin-saas-series";
import { getLtvWindow } from "@/lib/admin-ltv-window";
import { getVendorSalesTotals } from "@/lib/admin-vendor-sales";
import { RANGE_PRESETS, resolveDateWindow } from "@/lib/date-range";
import { isStripeBillingConfigured } from "@/lib/stripe";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import DateRangeFilter from "@/components/DateRangeFilter";
import AdminMedianLiveLine from "./AdminMedianLiveLine";
import AdminSaasPanels from "./AdminSaasPanels";
import AdminSalesSection from "./AdminSalesSection";
import AdminRecentOwnersSection from "./AdminRecentOwnersSection";

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const window = resolveDateWindow({
    range: params.range ?? "30d",
    from: params.from,
    to: params.to,
  });

  const compare = window.key !== "all";
  const [saas, series, ltv, ltvPrev, vendorSales, vendorSalesAllTime] =
    await Promise.all([
      getSaasStats(),
      getSaasSeries(window.start, window.end),
      getLtvWindow(window.start, window.end),
      compare
        ? getLtvWindow(window.prevStart, window.prevEnd)
        : Promise.resolve(null),
      getVendorSalesTotals({ start: window.start, end: window.end }),
      getVendorSalesTotals(),
    ]);

  const billingReady = isStripeBillingConfigured();

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Platform</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            SaaS overview
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            LTV is transaction fees plus subscription payments, in AUD — not
            stall sales. Vendor sales are shown separately.
          </p>
          <Suspense
            fallback={
              <p className="mt-1 text-sm text-[var(--muted)]">
                Median signup → first live product: …
              </p>
            }
          >
            <AdminMedianLiveLine />
          </Suspense>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <DashPrimaryCta href="/admin/invites">
            Free for Life invites
          </DashPrimaryCta>
          <Link
            href="/admin/billing"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 font-semibold"
          >
            Billing
          </Link>
          <Link
            href="/admin/payments"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 font-semibold"
          >
            Payments
          </Link>
          <Link
            href="/admin/owners"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 font-semibold"
          >
            Subscribers
          </Link>
        </div>
      </div>

      {!billingReady ? (
        <p className="text-sm text-red-700">
          Stripe Billing not configured. Set{" "}
          <code className="rounded bg-black/5 px-1">STRIPE_PRICE_ID_CASH</code>.
        </p>
      ) : null}

      <DateRangeFilter
        pathname="/admin"
        activeKey={window.key}
        from={window.fromParam}
        to={window.toParam}
        presets={RANGE_PRESETS}
      />

      <AdminSaasPanels
        windowLabel={window.label}
        saas={saas}
        series={series}
        ltv={ltv}
        ltvPrev={ltvPrev}
        vendorSales={vendorSales}
        vendorSalesAllTime={vendorSalesAllTime}
      />

      <AdminSalesSection
        windowLabel={window.label}
        start={window.start}
        end={window.end}
        prevStart={window.prevStart}
        prevEnd={window.prevEnd}
        compare={compare}
      />

      <Suspense
        fallback={
          <section className="dash-card p-5">
            <h2 className="text-lg font-semibold">Recent owners</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Loading…</p>
          </section>
        }
      >
        <AdminRecentOwnersSection />
      </Suspense>
    </main>
  );
}
