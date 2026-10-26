import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import type { StandMemberStatus } from "@/generated/prisma/client";

export type SupplierRow = {
  id: string;
  name: string;
  email: string;
  status: StandMemberStatus;
  _count: { products: number };
};

const COLUMNS: DataColumn[] = [
  { label: "Supplier" },
  { label: "Status" },
  { label: "Products", align: "right" },
];

const STATUS: Record<StandMemberStatus, PillSpec> = {
  ACTIVE: { label: "Active", tone: "success" },
  INVITED: { label: "Invited", tone: "attention" },
  REVOKED: { label: "Revoked", tone: "neutral" },
};

export default function SuppliersTable({ members }: { members: SupplierRow[] }) {
  return (
    <DataTable columns={COLUMNS} footer={`${members.length} supplier${members.length === 1 ? "" : "s"}`}>
      {members.map((member) => {
        const href = `/dashboard/suppliers/${member.id}`;
        return (
          <DataTableRow key={member.id} href={href}>
            <td className={`${cellClass(COLUMNS[0])} max-w-[280px]`}>
              <Link href={href} prefetch={false} className="block truncate font-semibold hover:underline">
                {member.name}
              </Link>
              <p className="truncate text-xs text-[var(--muted)]">{member.email}</p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <StatusPill {...STATUS[member.status]} />
            </td>
            <td className={`${cellClass(COLUMNS[2])} font-receipt whitespace-nowrap`}>
              {member._count.products}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
