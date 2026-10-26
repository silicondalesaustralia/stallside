import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import { formatMoney } from "@/lib/money";
import { formatDay } from "@/lib/production/format";
import { formatQuantity, type Unit } from "@/lib/production/unit-convert";
import ActionForm from "./ActionForm";
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
  lines: { id: string; ingredientName: string; quantity: number; unit: Unit; costCents: number; isPackaging: boolean }[];
};

const COLUMNS: DataColumn[] = [
  { label: "Batch" },
  { label: "Recipe → product", hideBelow: "sm" },
  { label: "Units", align: "right" },
  { label: "Cost", align: "right" },
  { label: "Per unit", align: "right", hideBelow: "md" },
  { label: "", align: "right" },
];

const num = "font-receipt whitespace-nowrap";

export const BATCH_LIST_LIMIT = 50;

export default function BatchList({ rows, currency, timeZone }: { rows: BatchListRow[]; currency: string; timeZone: string }) {
  if (rows.length === 0) {
    return (
      <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
        No batches yet. Record one each time you bake, print or make a run.
      </div>
    );
  }
  return (
    <DataTable
      columns={COLUMNS}
      footer={
        rows.length === BATCH_LIST_LIMIT
          ? `Showing the latest ${BATCH_LIST_LIMIT} batches`
          : `${rows.length} batch${rows.length === 1 ? "" : "es"}`
      }
    >
      {rows.map((b) => (
        <tr key={b.id} className="align-top">
          <td className={cellClass(COLUMNS[0])}>
            <p className="font-semibold">{b.batchCode}</p>
            <p className="text-xs text-[var(--muted)]">
              {formatDay(b.madeAt, timeZone)}
              {b.bestBefore ? ` · best before ${formatDay(b.bestBefore, timeZone)}` : ""}
            </p>
          </td>
          <td className={cellClass(COLUMNS[1])}>
            {b.recipeId ? (
              <Link href={`/dashboard/production/recipes/${b.recipeId}`} prefetch={false} className="hover:underline">
                {b.recipeName}
              </Link>
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
                    {l.ingredientName}
                    {l.isPackaging ? " (packaging)" : ""}: {formatQuantity(l.quantity, l.unit)} · {formatMoney(l.costCents, currency)}
                  </li>
                ))}
              </ul>
              {b.notes ? <p className="mt-1">{b.notes}</p> : null}
            </details>
          </td>
          <td className={`${cellClass(COLUMNS[2])} ${num}`}>{b.unitsMade}</td>
          <td className={`${cellClass(COLUMNS[3])} ${num}`}>{formatMoney(b.totalCostCents, currency)}</td>
          <td className={`${cellClass(COLUMNS[4])} ${num} text-[var(--muted)]`}>
            {b.unitCostCents == null ? "—" : formatMoney(b.unitCostCents, currency)}
          </td>
          <td className={cellClass(COLUMNS[5])}>
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
    </DataTable>
  );
}
