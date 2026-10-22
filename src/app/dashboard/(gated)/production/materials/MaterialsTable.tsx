import Link from "next/link";
import { ingredientCostPerBase } from "@/lib/production/batch-costing";
import { formatUnitCost } from "@/lib/production/format";
import { isLowMaterial, type MaterialRow } from "@/lib/production/load-cost-context";
import { formatQuantity } from "@/lib/production/unit-convert";
import { tdClass, thClass } from "../form-styles";

export default function MaterialsTable({ rows, currency }: { rows: MaterialRow[]; currency: string }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--line)] bg-white p-6 text-center text-sm text-[var(--muted)]">
        No materials yet. Add the ingredients or parts you buy, then record purchases as supplies arrive.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="border-b border-[var(--line)]">
          <tr>
            <th className={thClass}>Material</th>
            <th className={`${thClass} text-right`}>On hand</th>
            <th className={`${thClass} text-right`}>Cost</th>
            <th className={thClass}>Supplier</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((m) => {
            const low = isLowMaterial(m);
            return (
              <tr key={m.id} className={m.isActive ? "" : "opacity-60"}>
                <td className={tdClass}>
                  <Link href={`/dashboard/production/materials/${m.id}`} className="font-semibold hover:underline">
                    {m.name}
                  </Link>
                  {m.sku ? <p className="text-xs text-[var(--muted)]">{m.sku}</p> : null}
                  {!m.isActive ? <p className="text-xs text-[var(--muted)]">Archived</p> : null}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>
                  <span className={m.onHand < 0 || low ? "font-semibold text-red-700" : ""}>
                    {formatQuantity(m.onHand, m.baseUnit)}
                  </span>
                  {low ? <p className="text-xs font-semibold text-red-700">Reorder</p> : null}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>
                  {formatUnitCost(ingredientCostPerBase(m), m.baseUnit, currency)}
                </td>
                <td className={`${tdClass} text-[var(--muted)]`}>{m.supplier ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
