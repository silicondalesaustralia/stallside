import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { MobileUpsellRow } from "@/contracts/mobile/upsells";

const COLUMNS: DataColumn[] = [
  { label: "Upsell" },
  { label: "Status" },
  { label: "Applies to", hideBelow: "sm" },
  { label: "Checkout", hideBelow: "md" },
];

const muted = "text-[var(--muted)]";

export default function UpsellsTable({ upsells }: { upsells: MobileUpsellRow[] }) {
  return (
    <DataTable columns={COLUMNS} footer={`${upsells.length} upsell${upsells.length === 1 ? "" : "s"}`}>
      {upsells.map((u) => {
        const href = `/dashboard/upsells/${u.id}`;
        return (
          <DataTableRow key={u.id} href={href}>
            <td className={cellClass(COLUMNS[0])}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {u.name}
              </Link>
              <p className={`text-xs ${muted}`}>Offers {u.offer}</p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              {u.isActive ? <StatusPill label="Active" tone="success" /> : <StatusPill label="Paused" tone="neutral" />}
            </td>
            <td className={`${cellClass(COLUMNS[2])} ${muted}`}>{u.scope}</td>
            <td className={`${cellClass(COLUMNS[3])} ${muted}`}>{u.channels}</td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
