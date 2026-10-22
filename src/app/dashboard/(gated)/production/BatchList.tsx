import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDay } from "@/lib/production/format";
import { formatQuantity, type Unit } from "@/lib/production/unit-convert";
import ActionForm from "./ActionForm";
import { tdClass, thClass } from "./form-styles";
import { undoBatch } from "./undo-batch-action";

export type BatchListRow = {
  id: string;
  batchCode: string;
  madeAt: Date;
  bestBefore: Date | null;
  recipeId: string | null;
  recipeName: string;
  productName: string | null;
  batchCount: number;
  unitsMade: number;
  totalCostCents: number;
  unitCostCents: number | null;
  notes: string | null;
  lines: { id: string; ingredientName: string; quantity: number; unit: Unit; costCents: number }[];
};

export default function BatchList({ rows, currency, timeZone }: { rows: BatchListRow[]; currency: string; timeZone: string }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--line)] bg-white p-6 text-center text-sm text-[var(--muted)]">
        No batches yet. Record one each time you bake, print or make a run.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[48rem] text-sm">
        <thead className="border-b border-[var(--line)]">
          <tr>
            <th className={thClass}>Batch</th>
            <th className={thClass}>Recipe → product</th>
            <th className={`${thClass} text-right`}>Units</th>
            <th className={`${thClass} text-right`}>Cost</th>
            <th className={`${thClass} text-right`}>Per unit</th>
            <th className={thClass} />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((b) => (
            <tr key={b.id}>
              <td className={tdClass}>
                <p className="font-semibold">{b.batchCode}</p>
                <p className="text-xs text-[var(--muted)]">
                  {formatDay(b.madeAt, timeZone)}
                  {b.bestBefore ? ` · best before ${formatDay(b.bestBefore, timeZone)}` : ""}
                </p>
              </td>
              <td className={tdClass}>
                {b.recipeId ? (
                  <Link href={`/dashboard/production/recipes/${b.recipeId}`} className="underline">{b.recipeName}</Link>
                ) : (
                  b.recipeName
                )}
                {b.batchCount !== 1 ? ` ×${b.batchCount}` : ""}
                <p className="text-xs text-[var(--muted)]">{b.productName ?? "No product stock"}</p>
                <details className="text-xs text-[var(--muted)]">
                  <summary className="cursor-pointer">Used {b.lines.length} material(s)</summary>
                  <ul className="mt-1">
                    {b.lines.map((l) => (
                      <li key={l.id}>
                        {l.ingredientName}: {formatQuantity(l.quantity, l.unit)} · {formatMoney(l.costCents, currency)}
                      </li>
                    ))}
                  </ul>
                  {b.notes ? <p className="mt-1">{b.notes}</p> : null}
                </details>
              </td>
              <td className={`${tdClass} text-right tabular-nums`}>{b.unitsMade}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(b.totalCostCents, currency)}</td>
              <td className={`${tdClass} text-right tabular-nums`}>
                {b.unitCostCents == null ? "—" : formatMoney(b.unitCostCents, currency)}
              </td>
              <td className={`${tdClass} text-right`}>
                <ActionForm
                  action={undoBatch}
                  submitLabel="Undo"
                  variant="danger"
                  className="inline-flex"
                  confirmMessage="Undo this batch? Materials go back into stock and its units come off the product."
                >
                  <input type="hidden" name="id" value={b.id} />
                </ActionForm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
