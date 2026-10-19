import { formatMoney } from "@/lib/money";
import type { InventoryRow } from "@/lib/inventory/load-inventory-report";
import { summarizeInventory } from "@/lib/inventory/summary";

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-receipt text-xl font-semibold leading-tight tabular-nums [overflow-wrap:anywhere] sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

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

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
      <Tile label="Products" value={String(rows.length)} />
      <Tile label="Low stock" value={String(low)} />
      <Tile label="Out of stock" value={String(out)} />
      <Tile label="Runs out ≤ 7 days" value={String(runningOut)} hint="At 30-day sale rate" />
      <Tile
        label="Stock value (cost)"
        value={formatMoney(costValue, currency)}
        hint={missingCost > 0 ? `${missingCost} without a cost` : undefined}
      />
      <Tile
        label="Stock value (retail)"
        value={formatMoney(retailValue, currency)}
        hint={`${sold30} units sold in 30 days`}
      />
    </div>
  );
}
