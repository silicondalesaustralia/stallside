import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import { formatMoney } from "@/lib/money";
import type { ProfitProductRow } from "@/lib/production/load-profit";
import { formatPercent, marginPercent } from "@/lib/production/pricing";

const COLUMNS: DataColumn[] = [
  { label: "Product" },
  { label: "Units", align: "right" },
  { label: "Revenue", align: "right", hideBelow: "sm" },
  { label: "Cost", align: "right", hideBelow: "md" },
  { label: "Profit", align: "right" },
  { label: "Margin", align: "right", hideBelow: "sm" },
];

const num = "font-receipt whitespace-nowrap";

export default function ProfitProductTable({ rows, currency }: { rows: ProfitProductRow[]; currency: string }) {
  if (rows.length === 0) {
    return (
      <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No sales in this period.</div>
    );
  }
  return (
    <DataTable columns={COLUMNS} footer={`${rows.length} product${rows.length === 1 ? "" : "s"}`}>
      {rows.map((r) => {
        const href = `/dashboard/products/${r.productId}`;
        const profit = r.revenueCents - r.costCents;
        const margin = marginPercent(r.revenueCents, profit);
        return (
          <DataTableRow key={r.productId} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {r.name}
              </Link>
              {r.unknownCostUnits > 0 ? (
                <p className="text-xs text-[var(--warn)]">
                  {r.unknownCostUnits} unit(s) without a cost. Set one on the product or record a batch.
                </p>
              ) : null}
            </td>
            <td className={`${cellClass(COLUMNS[1])} ${num}`}>{r.units}</td>
            <td className={`${cellClass(COLUMNS[2])} ${num}`}>{formatMoney(r.revenueCents, currency)}</td>
            <td className={`${cellClass(COLUMNS[3])} ${num} text-[var(--muted)]`}>
              {formatMoney(r.costCents, currency)}
            </td>
            <td className={`${cellClass(COLUMNS[4])} ${num} font-semibold ${profit < 0 ? "text-[var(--gone)]" : ""}`}>
              {formatMoney(profit, currency)}
            </td>
            <td className={`${cellClass(COLUMNS[5])} ${num}`}>{formatPercent(margin)}</td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
