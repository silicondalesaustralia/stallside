import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { formatMoney } from "@/lib/money";
import type { OwnerCustomerRow } from "@/lib/customers/service";

const COLUMNS: DataColumn[] = [
  { label: "Customer" },
  { label: "Marketing", hideBelow: "md" },
  { label: "Source", hideBelow: "lg" },
  { label: "Orders", align: "right", hideBelow: "sm" },
  { label: "Lifetime spend", align: "right" },
];

const muted = "text-[var(--muted)]";

export default function CustomersTable({ customers }: { customers: OwnerCustomerRow[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      footer={`${customers.length} customer${customers.length === 1 ? "" : "s"}`}
    >
      {customers.map((c) => {
        const href = `/dashboard/customers/${c.id}`;
        const spend = c.orders.reduce((sum, o) => sum + o.totalCents, 0);
        const currency = c.orders[0]?.currency ?? "AUD";
        const contact = [c.name ? c.email : null, c.phone].filter(Boolean).join(" · ");
        return (
          <DataTableRow key={c.id} href={href}>
            <td className={`${cellClass(COLUMNS[0])} max-w-[260px]`}>
              <Link href={href} prefetch={false} className="block truncate font-semibold hover:underline">
                {c.name || c.email || "Customer"}
              </Link>
              {contact ? <p className={`truncate text-xs ${muted}`}>{contact}</p> : null}
            </td>
            <td className={cellClass(COLUMNS[1])}>
              {c.marketingConsent ? (
                <StatusPill label="Marketing ok" tone="success" />
              ) : (
                <span className={muted}>—</span>
              )}
            </td>
            <td className={`${cellClass(COLUMNS[2])} whitespace-nowrap ${muted}`}>
              {c.source ?? "—"}
            </td>
            <td className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap`}>
              {c._count.orders}
            </td>
            <td className={`${cellClass(COLUMNS[4])} font-receipt whitespace-nowrap`}>
              {spend > 0 ? formatMoney(spend, currency) : <span className={muted}>—</span>}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
