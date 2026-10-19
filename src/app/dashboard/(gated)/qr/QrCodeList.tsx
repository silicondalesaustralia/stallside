import Link from "next/link";
import type { OwnerQrCode } from "@/lib/qr/owner-codes";

export default function QrCodeList({ codes }: { codes: OwnerQrCode[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">QR codes for pages</h2>
      {codes.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          None yet. Make one for a category shelf, a product, a menu or your checkout.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {codes.map((qr) => (
            <li key={qr.id} className="dash-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--ink)]">
                  {qr.name}
                  {qr.atStall ? (
                    <span className="ml-2 rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-medium">At the stall</span>
                  ) : null}
                </p>
                {qr.destination ? (
                  <p className="text-sm text-[var(--muted)]">
                    Opens {qr.destination.label} <span className="font-receipt text-xs">({qr.destination.path})</span>
                    {" · "}
                    {qr.standName}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--warn)]">Page removed, so scans open your website home.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href={`/dashboard/qr/${qr.id}/duplicate`} className="underline">
                  Duplicate
                </Link>
                <Link href={`/dashboard/qr/${qr.id}`} className="font-semibold text-[var(--leaf-dark)] underline">
                  Edit &amp; print
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
