import Link from "next/link";
import { Suspense } from "react";
import AdminRecentOwners from "@/components/AdminRecentOwners";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSaasStats } from "@/lib/admin-saas-stats";
import { getSaasSeries } from "@/lib/admin-saas-series";
import { getLtvWindow } from "@/lib/admin-ltv-window";
import { RANGE_PRESETS, resolveDateWindow } from "@/lib/date-range";
import { isStripeBillingConfigured } from "@/lib/stripe";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import DateRangeFilter from "@/components/DateRangeFilter";
import AdminMedianLiveLine from "./AdminMedianLiveLine";
import AdminSaasPanels from "./AdminSaasPanels";
import AdminSalesSection from "./AdminSalesSection";

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
  const [saas, series, ltv, ltvPrev] = await Promise.all([
    getSaasStats(),
    getSaasSeries(window.start, window.end),
    getLtvWindow(window.start, window.end),
    compare
      ? getLtvWindow(window.prevStart, window.prevEnd)
      : Promise.resolve(null),
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
            Stall sales count every order, whatever the payment method or fee.
            LTV is Vendl&apos;s fees plus subscription payments, in AUD.
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

      <AdminSalesSection
        windowLabel={window.label}
        start={window.start}
        end={window.end}
        prevStart={window.prevStart}
        prevEnd={window.prevEnd}
        compare={compare}
      />

      <AdminSaasPanels
        windowLabel={window.label}
        saas={saas}
        series={series}
        ltv={ltv}
        ltvPrev={ltvPrev}
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

async function AdminRecentOwnersSection() {
  const recent = await prisma.owner.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      user: true,
      stands: { select: { name: true }, take: 3 },
    },
  });
  return (
    <section className="dash-card p-5">
      <h2 className="text-lg font-semibold">Recent owners</h2>
      <AdminRecentOwners owners={recent} />
    </section>
  );
}
