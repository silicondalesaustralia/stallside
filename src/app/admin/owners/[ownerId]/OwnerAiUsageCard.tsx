import AdminUsageStat from "@/components/AdminUsageStat";
import AdminUsageTable from "@/components/AdminUsageTable";
import { ownerAiUsage } from "@/lib/website-ai/assistant/usage/summary-owner";
import { formatTokens, formatUsdMicros } from "@/lib/website-ai/assistant/usage/format";

type Props = { ownerId: string; audPerUsd: number | undefined };

export default async function OwnerAiUsageCard({ ownerId, audPerUsd }: Props) {
  const usage = await ownerAiUsage(ownerId);
  const cost = (micros: number | null) => formatUsdMicros(micros, audPerUsd);
  const unknown = usage.allTime.unknownCostCalls;

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-lg font-semibold">AI usage</h2>
        <p className="text-xs text-[var(--muted)]">
          Estimated provider cost of the AI website assistant. Costs are recorded from 16 Oct 2026.
          {unknown > 0 ? ` ${unknown} call${unknown === 1 ? " has" : "s have"} no price set yet.` : ""}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminUsageStat
          label="Builds"
          value={`${usage.builds.successful} of ${usage.builds.total}`}
          hint={`finished · ${usage.builds.thisMonth} this month`}
        />
        <AdminUsageStat label="Cost this month" value={cost(usage.thisMonth.costUsdMicros)} />
        <AdminUsageStat
          label="Cost all time"
          value={cost(usage.allTime.costUsdMicros)}
          hint={`${formatTokens(usage.allTime.inputTokens + usage.allTime.outputTokens)} tokens · ${usage.allTime.images} images`}
        />
        <AdminUsageStat label="Average per build" value={cost(usage.builds.avgCostUsdMicros)} />
      </div>
      <AdminUsageTable
        headers={["Date", "Status", "Mode", "Model", "Tokens", "Images", "Cost"]}
        empty="No website builds yet."
        rows={usage.recent.map((b) => ({
          key: b.id,
          cells: [
            b.createdAt.toLocaleDateString("en-AU"),
            b.status.toLowerCase().replace("_", " "),
            b.mode,
            b.model ?? "-",
            formatTokens(b.tokens),
            b.images,
            b.costUsdMicros > 0 ? cost(b.costUsdMicros) : "-",
          ],
        }))}
      />
    </section>
  );
}
