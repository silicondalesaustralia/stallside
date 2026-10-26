import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillTone } from "@/components/dashboard/ui/StatusPill";
import { STOCK_STATUS_LABEL, supplyStatusLabel, type StockStatus } from "@/lib/inventory/inventory-status";
import type { InventoryRow } from "@/lib/inventory/load-inventory-report";

function shortDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" });
}

function coverText(days: number | null): string {
  if (days == null) return "—";
  if (days >= 365) return "365+";
  return days < 10 ? days.toFixed(1) : String(Math.round(days));
}

const STOCK_TONE: Record<StockStatus, PillTone> = { in_stock: "success", low: "warning", out: "critical" };

const COLUMNS: DataColumn[] = [
  { label: "Product" },
  { label: "Status" },
  { label: "On hand", align: "right" },
  { label: "Sold 7d", align: "right", hideBelow: "md" },
  { label: "Sold 30d", align: "right", hideBelow: "sm" },
  { label: "Per day", align: "right", hideBelow: "lg" },
  { label: "Days cover", align: "right", hideBelow: "sm" },
  { label: "Last sold", hideBelow: "lg" },
  { label: "Last counted", hideBelow: "lg" },
];

const num = "font-receipt whitespace-nowrap";

export default function InventoryReportTable({ rows }: { rows: InventoryRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No products match.</div>
    );
  }
  return (
    <DataTable columns={COLUMNS} footer={`${rows.length} product${rows.length === 1 ? "" : "s"}`}>
      {rows.map((r) => {
        const href = `/dashboard/products/${r.id}`;
        const supply = supplyStatusLabel(r.supplyStatus);
        return (
          <DataTableRow key={r.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {r.name}
              </Link>
              <p className="text-xs text-[var(--muted)]">
                {r.sku ? `SKU ${r.sku} · ` : ""}
                {r.locationName}
              </p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <div className="flex flex-wrap gap-1">
                <StatusPill label={STOCK_STATUS_LABEL[r.stockStatus]} tone={STOCK_TONE[r.stockStatus]} />
                {supply ? <StatusPill label={supply} tone="info" /> : null}
                {r.incoming > 0 ? <StatusPill label={`${r.incoming} incoming`} tone="attention" /> : null}
              </div>
            </td>
            <td className={`${cellClass(COLUMNS[2])} ${num} font-semibold`}>{r.stockQuantity}</td>
            <td className={`${cellClass(COLUMNS[3])} ${num}`}>{r.sold7}</td>
            <td className={`${cellClass(COLUMNS[4])} ${num}`}>{r.sold30}</td>
            <td className={`${cellClass(COLUMNS[5])} ${num}`}>{r.dailyRate.toFixed(1)}</td>
            <td
              className={`${cellClass(COLUMNS[6])} ${num} ${
                r.daysCover != null && r.daysCover <= 7 ? "font-semibold text-[var(--gone)]" : ""
              }`}
            >
              {coverText(r.daysCover)}
            </td>
            <td className={`${cellClass(COLUMNS[7])} whitespace-nowrap text-[var(--muted)]`}>
              {shortDate(r.lastSoldAt)}
            </td>
            <td className={`${cellClass(COLUMNS[8])} whitespace-nowrap text-[var(--muted)]`}>
              {shortDate(r.lastCountedAt)}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
