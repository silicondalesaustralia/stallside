import Link from "next/link";
import StockStatusBadges from "@/components/inventory/StockStatusBadges";
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

const th = "px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]";
const td = "px-3 py-2.5 align-top tabular-nums";

export default function InventoryReportTable({ rows }: { rows: InventoryRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No products match.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[56rem] text-sm">
        <thead className="border-b border-[var(--line)]">
          <tr>
            <th className={th}>Product</th>
            <th className={th}>Status</th>
            <th className={`${th} text-right`}>On hand</th>
            <th className={`${th} text-right`}>Sold 7d</th>
            <th className={`${th} text-right`}>Sold 30d</th>
            <th className={`${th} text-right`}>Per day</th>
            <th className={`${th} text-right`}>Days cover</th>
            <th className={th}>Last sold</th>
            <th className={th}>Last counted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={td}>
                <Link
                  href={`/dashboard/products/${r.id}`}
                  className="font-semibold hover:underline"
                >
                  {r.name}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  {r.sku ? `SKU ${r.sku} · ` : ""}
                  {r.locationName}
                </p>
              </td>
              <td className={td}>
                <StockStatusBadges
                  stockStatus={r.stockStatus}
                  supplyStatus={r.supplyStatus}
                  incoming={r.incoming}
                />
              </td>
              <td className={`${td} text-right font-semibold`}>{r.stockQuantity}</td>
              <td className={`${td} text-right`}>{r.sold7}</td>
              <td className={`${td} text-right`}>{r.sold30}</td>
              <td className={`${td} text-right`}>{r.dailyRate.toFixed(1)}</td>
              <td
                className={`${td} text-right ${
                  r.daysCover != null && r.daysCover <= 7 ? "font-semibold text-red-700" : ""
                }`}
              >
                {coverText(r.daysCover)}
              </td>
              <td className={td}>{shortDate(r.lastSoldAt)}</td>
              <td className={td}>{shortDate(r.lastCountedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
