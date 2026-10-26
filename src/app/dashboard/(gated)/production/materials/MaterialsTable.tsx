import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import { ingredientCostPerBase } from "@/lib/production/batch-costing";
import { formatUnitCost } from "@/lib/production/format";
import { isLowMaterial, type MaterialRow } from "@/lib/production/load-cost-context";
import { formatQuantity } from "@/lib/production/unit-convert";

const COLUMNS: DataColumn[] = [
  { label: "Material" },
  { label: "Status" },
  { label: "On hand", align: "right" },
  { label: "Cost", align: "right", hideBelow: "sm" },
  { label: "Supplier", hideBelow: "md" },
];

function statusPill(m: MaterialRow): PillSpec {
  if (!m.isActive) return { label: "Archived", tone: "neutral" };
  if (m.onHand <= 0) return { label: "Out", tone: "critical" };
  if (isLowMaterial(m)) return { label: "Reorder", tone: "warning" };
  return { label: "In stock", tone: "success" };
}

export default function MaterialsTable({ rows, currency }: { rows: MaterialRow[]; currency: string }) {
  if (rows.length === 0) {
    return (
      <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
        No materials yet. Add the ingredients or parts you buy, then record purchases as supplies arrive.
      </div>
    );
  }
  return (
    <DataTable columns={COLUMNS} footer={`${rows.length} material${rows.length === 1 ? "" : "s"}`}>
      {rows.map((m) => {
        const href = `/dashboard/production/materials/${m.id}`;
        const flagged = m.isActive && (m.onHand < 0 || isLowMaterial(m));
        return (
          <DataTableRow key={m.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {m.name}
              </Link>
              {m.sku ? <p className="text-xs text-[var(--muted)]">SKU {m.sku}</p> : null}
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <StatusPill {...statusPill(m)} />
            </td>
            <td
              className={`${cellClass(COLUMNS[2])} font-receipt whitespace-nowrap ${
                flagged ? "font-semibold text-[var(--gone)]" : ""
              }`}
            >
              {formatQuantity(m.onHand, m.baseUnit)}
            </td>
            <td className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap`}>
              {formatUnitCost(ingredientCostPerBase(m), m.baseUnit, currency)}
            </td>
            <td className={`${cellClass(COLUMNS[4])} text-[var(--muted)]`}>{m.supplier ?? "—"}</td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
