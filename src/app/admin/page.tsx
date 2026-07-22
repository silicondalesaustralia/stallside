import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { getSaasStats } from "@/lib/admin-saas-stats";
import { getSaasSeries } from "@/lib/admin-saas-series";
import { resolveDateWindow } from "@/lib/date-range";
import { isStripeBillingConfigured } from "@/lib/stripe";
import DashboardStat from "@/components/DashboardStat";
import DateRangeFilter from "@/components/DateRangeFilter";
import SaasSeriesChart from "@/components/SaasSeriesChart";

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

  const [saas, series, recent] = await Promise.all([
    getSaasStats(),
    getSaasSeries(window.start, window.end),
    prisma.owner.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: true,
        stands: { select: { name: true }, take: 3 },
      },
    }),
  ]);

  const billingReady = isStripeBillingConfigured();

  return (
    <main className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">SaaS admin</h1>
          <p className="mt-1 text-[var(--muted)]">
            Subscriptions, owners, and Stallside revenue, not stand checkout sales.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin/invites"
            className="rounded-lg bg-[var(--leaf)] px-3 py-2 font-semibold text-white"
          >
            Free for Life invites
          </Link>
          <Link
            href="/admin/billing"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-semibold"
          >
            Billing &amp; coupons
          </Link>
          <Link
            href="/admin/owners"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-semibold"
          >
            All subscribers
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
      />

      <SaasSeriesChart points={series} title={`${window.label} · SaaS activity`} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="MRR"
          value={formatMoney(saas.mrrCents, saas.currency)}
        />
        <DashboardStat
          label="LTV collected"
          value={formatMoney(saas.totalLtvCents, saas.currency)}
        />
        <DashboardStat label="Live subs" value={String(saas.liveSubscribers)} />
        <DashboardStat label="Owners" value={String(saas.owners)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat label="Active" value={String(saas.active)} />
        <DashboardStat label="Trialing" value={String(saas.trialing)} />
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

      <section>
        <h2 className="text-lg font-semibold">Recent owners</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {recent.map((owner) => (
              <li key={owner.id} className="flex flex-wrap justify-between gap-2 py-3">
                <div>
                  <Link
                    href={`/admin/owners/${owner.id}`}
                    className="font-medium underline"
                  >
                    {owner.businessName}
                  </Link>
                  <p className="text-[var(--muted)]">
                    {owner.user.email}
                    {owner.stands[0]
                      ? ` · ${owner.stands.map((s) => s.name).join(", ")}`
                      : ""}
                  </p>
                </div>
                <p className="text-[var(--muted)]">
                  {owner.subscriptionPlan ?? "—"} ·{" "}
                  {owner.subscriptionStatus.toLowerCase()} · LTV{" "}
                  {formatMoney(owner.lifetimePaidCents, saas.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
