import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { formatCollectionLabel } from "@/lib/pre-order";
import type { OwnerPreOrderPageRow } from "@/lib/pre-order-pages/service";

const COLUMNS: DataColumn[] = [
  { label: "Page" },
  { label: "Status" },
  { label: "Collection", hideBelow: "sm" },
  { label: "Products", align: "right", hideBelow: "md" },
  { label: "", align: "right" },
];

const muted = "text-[var(--muted)]";
const actionLink = "font-semibold text-[var(--leaf-dark)] underline";

export default function PreOrderPagesTable({
  pages,
  publicUrl,
}: {
  pages: OwnerPreOrderPageRow[];
  publicUrl: Record<string, string>;
}) {
  return (
    <DataTable columns={COLUMNS} footer={`${pages.length} pre-order page${pages.length === 1 ? "" : "s"}`}>
      {pages.map((page) => {
        const href = `/dashboard/pre-order-pages/${page.id}`;
        const url = publicUrl[page.id];
        return (
          <DataTableRow key={page.id} href={href}>
            <td className={`${cellClass(COLUMNS[0])} max-w-[320px]`}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {page.title}
              </Link>
              <p className={`truncate text-xs ${muted}`}>{url}</p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              {page.isActive ? <StatusPill label="Active" tone="success" /> : <StatusPill label="Paused" tone="neutral" />}
            </td>
            <td className={`${cellClass(COLUMNS[2])} whitespace-nowrap ${muted}`}>
              {formatCollectionLabel(page.collectionAt)}
            </td>
            <td className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap`}>{page._count.items}</td>
            <td className={cellClass(COLUMNS[4])}>
              <div className="flex justify-end gap-3 whitespace-nowrap">
                <Link href={`${href}/qr`} prefetch={false} className={actionLink}>
                  QR
                </Link>
                <Link href={url} target="_blank" className={actionLink}>
                  Open
                </Link>
              </div>
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
