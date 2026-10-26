import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";

export type UpsellOverrideRow = { id: string; name: string; offers: string; href: string };

export default function UpsellOverrideTable({
  label,
  noun,
  rows,
}: {
  label: string;
  noun: string;
  rows: UpsellOverrideRow[];
}) {
  const columns: DataColumn[] = [{ label }, { label: "Offers" }];
  return (
    <DataTable columns={columns} footer={`${rows.length} ${noun}${rows.length === 1 ? "" : "s"}`}>
      {rows.map((r) => (
        <DataTableRow key={r.id} href={r.href}>
          <td className={cellClass(columns[0])}>
            <Link href={r.href} prefetch={false} className="font-semibold hover:underline">
              {r.name}
            </Link>
          </td>
          <td className={`${cellClass(columns[1])} text-[var(--muted)]`}>{r.offers}</td>
        </DataTableRow>
      ))}
    </DataTable>
  );
}
