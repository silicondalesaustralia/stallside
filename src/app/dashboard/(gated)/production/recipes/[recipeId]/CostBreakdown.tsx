import type { RecipeCost } from "@/lib/production/batch-costing";
import { money } from "@/lib/production/format";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 ${strong ? "font-semibold" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function CostBreakdown({
  cost,
  yieldQuantity,
  yieldLabel,
  currency,
}: {
  cost: RecipeCost;
  yieldQuantity: number;
  yieldLabel: string;
  currency: string;
}) {
  return (
    <div className="flex flex-col divide-y divide-[var(--line)] text-sm">
      <Row label="Materials (incl. waste)" value={money(cost.materialCents, currency)} />
      <Row label="Labour" value={money(cost.labourCents, currency)} />
      <Row label="Overhead" value={money(cost.overheadCents, currency)} />
      <Row label="Batch total" value={money(cost.totalCents, currency)} strong />
      <Row
        label={`Per unit (${yieldQuantity} ${yieldLabel} per batch)`}
        value={money(yieldQuantity > 0 ? cost.totalCents / yieldQuantity : 0, currency)}
        strong
      />
      {cost.problems.length > 0 ? (
        <ul className="list-disc pt-2 pl-5 text-xs text-red-700">
          {[...new Set(cost.problems)].map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
