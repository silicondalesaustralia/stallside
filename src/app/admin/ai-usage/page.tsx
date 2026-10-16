import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { audRatesFromMarket } from "@/lib/fx-to-aud";
import AdminUsageStat from "@/components/AdminUsageStat";
import AdminUsageTable from "@/components/AdminUsageTable";
import { platformAiUsage } from "@/lib/website-ai/assistant/usage/summary-platform";
import { FEATURE_LABELS, formatTokens, formatUsdMicros } from "@/lib/website-ai/assistant/usage/format";

export default async function AdminAiUsagePage() {
  await requireAdmin();
  const [usage, fx] = await Promise.all([platformAiUsage(), audRatesFromMarket()]);
  const cost = (micros: number | null) => formatUsdMicros(micros, fx.USD);
  const unknown = usage.allTime.unknownCostCalls;

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI usage</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Estimated provider cost of the AI website assistant, recorded from 16 Oct 2026.
          {unknown > 0 ? ` ${unknown} call${unknown === 1 ? " has" : "s have"} no price set, so the totals are low.` : ""}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminUsageStat label="Cost this month" value={cost(usage.thisMonth.costUsdMicros)} hint={`${usage.thisMonth.calls} AI calls`} />
        <AdminUsageStat
          label="Cost all time"
          value={cost(usage.allTime.costUsdMicros)}
          hint={`${formatTokens(usage.allTime.inputTokens + usage.allTime.outputTokens)} tokens · ${usage.allTime.images} images`}
        />
        <AdminUsageStat label="Average per finished build" value={cost(usage.builds.avgCostUsdMicros)} />
        <AdminUsageStat label="Builds" value={`${usage.builds.successful} finished`} hint={`${usage.builds.failed} failed`} />
      </section>

      <section className="dash-card flex flex-col gap-3 p-5">
        <h2 className="text-lg font-semibold">By month</h2>
        <AdminUsageTable
          headers={["Month", "AI calls", "Tokens", "Cost"]}
          empty="No AI usage recorded yet."
          rows={usage.months.map((m) => ({
            key: m.month.toISOString(),
            cells: [
              m.month.toLocaleDateString("en-AU", { month: "short", year: "numeric", timeZone: "UTC" }),
              m.calls,
              formatTokens(m.tokens),
              cost(m.costUsdMicros),
            ],
          }))}
        />
      </section>

      <section className="dash-card flex flex-col gap-3 p-5">
        <h2 className="text-lg font-semibold">By feature</h2>
        <AdminUsageTable
          headers={["Feature", "AI calls", "Tokens", "Cost"]}
          empty="No AI usage recorded yet."
          rows={usage.features.map((f) => ({
            key: f.feature,
            cells: [FEATURE_LABELS[f.feature] ?? f.feature, f.calls, formatTokens(f.tokens), cost(f.costUsdMicros)],
          }))}
        />
      </section>

      <section className="dash-card flex flex-col gap-3 p-5">
        <h2 className="text-lg font-semibold">Highest-cost accounts</h2>
        <AdminUsageTable
          headers={["Account", "AI calls", "Tokens", "Cost"]}
          empty="No AI usage recorded yet."
          rows={usage.accounts.map((a) => ({
            key: a.ownerId,
            cells: [
              <Link key="name" href={`/admin/owners/${a.ownerId}`} className="underline">{a.name}</Link>,
              a.calls,
              formatTokens(a.tokens),
              cost(a.costUsdMicros),
            ],
          }))}
        />
      </section>
    </main>
  );
}
