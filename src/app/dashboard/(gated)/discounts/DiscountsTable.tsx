import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import type { DiscountRow } from "@/lib/discounts/load";

const COLUMNS: DataColumn[] = [
  { label: "Code" },
  { label: "Status" },
  { label: "Discount", hideBelow: "md" },
  { label: "Uses", align: "right", hideBelow: "sm" },
];

function statusPill(status: string | null): PillSpec {
  if (status === "Off") return { label: "Paused", tone: "neutral" };
  if (status === "Scheduled") return { label: "Scheduled", tone: "info" };
  if (status === "Expired") return { label: "Expired", tone: "warning" };
  if (status) return { label: status, tone: "attention" };
  return { label: "Active", tone: "success" };
}

export default function DiscountsTable({ discounts }: { discounts: DiscountRow[] }) {
  return (
    <DataTable columns={COLUMNS} footer={`${discounts.length} discount${discounts.length === 1 ? "" : "s"}`}>
      {discounts.map((d) => {
        const href = `/dashboard/discounts/${d.id}`;
        return (
          <DataTableRow key={d.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-mono font-semibold hover:underline">
                {d.code}
              </Link>
              {d.name ? <p className="text-xs text-[var(--muted)]">{d.name}</p> : null}
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <StatusPill {...statusPill(d.status)} />
            </td>
            <td className={`${cellClass(COLUMNS[2])} text-[var(--muted)]`}>{d.summary}</td>
            <td className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap`}>{d.uses}</td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
