import Link from "next/link";
import { businessQrHref } from "@/lib/qr/hrefs";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import QrRowActions from "./QrRowActions";

export type BusinessQrRow = {
  id: string;
  name: string;
  slug: string;
  cartMode: "PRODUCT" | "CUSTOMER_CHOICE";
  /** The farmstand link the QR encodes. */
  url: string;
};

const COLUMNS: DataColumn[] = [{ label: "Business" }, { label: "Opens" }, { label: "", align: "right" }];

export default function BusinessQrList({ stands }: { stands: BusinessQrRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Farmstand QR</h2>
      <DataTable columns={COLUMNS}>
        {stands.map((stand) => {
          const target = stand.url;
          const destLabel = stand.cartMode === "CUSTOMER_CHOICE" ? "Farmstand · pay page" : "Farmstand";
          const href = businessQrHref(stand.id);
          return (
            <DataTableRow key={stand.id} href={href}>
              <td className={cellClass(COLUMNS[0])}>
                <Link href={href} prefetch={false} className="font-semibold hover:underline">
                  {stand.name}
                </Link>
              </td>
              <td className={`${cellClass(COLUMNS[1])} max-w-[320px]`}>
                <p>{destLabel}</p>
                <p className="truncate font-receipt text-xs text-[var(--muted)]">{target}</p>
              </td>
              <td className={cellClass(COLUMNS[2])}>
                <QrRowActions href={href} />
              </td>
            </DataTableRow>
          );
        })}
      </DataTable>
    </section>
  );
}
