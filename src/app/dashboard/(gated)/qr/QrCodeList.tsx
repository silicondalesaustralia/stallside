import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { OwnerQrCode } from "@/lib/qr/owner-codes";
import QrRowActions from "./QrRowActions";

const COLUMNS: DataColumn[] = [
  { label: "QR code" },
  { label: "Opens" },
  { label: "Business", hideBelow: "md" },
  { label: "", align: "right" },
];

export default function QrCodeList({ codes }: { codes: OwnerQrCode[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">QR codes for pages</h2>
      {codes.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          None yet. Make one for a category shelf, a product, a menu or your checkout.
        </div>
      ) : (
        <DataTable columns={COLUMNS} footer={`${codes.length} QR code${codes.length === 1 ? "" : "s"}`}>
          {codes.map((qr) => {
            const href = `/dashboard/qr/${qr.id}`;
            return (
              <DataTableRow key={qr.id} href={href}>
                <td className={cellClass(COLUMNS[0])}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={href} prefetch={false} className="font-semibold hover:underline">
                      {qr.name}
                    </Link>
                    {qr.atStall ? <StatusPill label="At the stall" tone="info" /> : null}
                  </div>
                </td>
                <td className={`${cellClass(COLUMNS[1])} max-w-[320px]`}>
                  {qr.destination ? (
                    <>
                      <p>{qr.destination.label}</p>
                      <p className="truncate font-receipt text-xs text-[var(--muted)]">{qr.destination.path}</p>
                    </>
                  ) : (
                    <p className="text-[var(--warn)]">Page removed, so scans open your website home.</p>
                  )}
                </td>
                <td className={`${cellClass(COLUMNS[2])} whitespace-nowrap text-[var(--muted)]`}>{qr.standName}</td>
                <td className={cellClass(COLUMNS[3])}>
                  <QrRowActions href={href} />
                </td>
              </DataTableRow>
            );
          })}
        </DataTable>
      )}
    </section>
  );
}
