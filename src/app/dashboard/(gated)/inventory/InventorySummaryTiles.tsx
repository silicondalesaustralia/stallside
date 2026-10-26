import StatsStrip, { type StripStat } from "@/components/dashboard/ui/StatsStrip";
import { formatMoney } from "@/lib/money";
import type { InventoryRow } from "@/lib/inventory/load-inventory-report";
import { summarizeInventory } from "@/lib/inventory/summary";

export default function InventorySummaryTiles({ rows }: { rows: InventoryRow[] }) {
  const {
    currency,
    costValueCents: costValue,
    retailValueCents: retailValue,
    missingCost,
    sold30,
    low,
    out,
    runningOut,
  } = summarizeInventory(rows);

  const stats: StripStat[] = [
    { label: "Products", value: String(rows.length), current: rows.length },
    { label: "Low stock", value: String(low), current: low },
    { label: "Out of stock", value: String(out), current: out },
    { label: "Runs out ≤ 7 days", value: String(runningOut), current: runningOut },
    { label: "Stock value (cost)", value: formatMoney(costValue, currency), current: costValue },
    { label: "Stock value (retail)", value: formatMoney(retailValue, currency), current: retailValue },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <StatsStrip stats={stats} />
      <p className="px-1 text-xs text-[var(--muted)]">
        Run-out at 30-day sale rate · {sold30} units sold in 30 days
        {missingCost > 0 ? ` · ${missingCost} without a cost` : ""}
      </p>
    </div>
  );
}
