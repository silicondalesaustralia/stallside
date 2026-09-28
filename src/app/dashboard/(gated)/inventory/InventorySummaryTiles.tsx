import { formatMoney } from "@/lib/money";
import type { InventoryRow } from "@/lib/inventory/load-inventory-report";

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
  const currency = rows[0]?.currency ?? "AUD";
  let costValue = 0;
  let retailValue = 0;
  let missingCost = 0;
  let sold30 = 0;
  for (const r of rows) {
    const onHand = Math.max(0, r.stockQuantity);
    retailValue += r.priceCents * onHand;
    if (r.costCents == null) missingCost += 1;
    else costValue += r.costCents * onHand;
    sold30 += r.sold30;
  }
  const low = rows.filter((r) => r.stockStatus === "low").length;
  const out = rows.filter((r) => r.stockStatus === "out").length;
  const runningOut = rows.filter((r) => r.daysCover != null && r.daysCover <= 7).length;

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
