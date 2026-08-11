import Link from "next/link";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";

/** Compact QR preview above setup tabs. */
export default function BusinessCheckoutStrip({
  standId,
  standSlug,
  qrDataUrl,
  paymentBrands,
}: {
  standId: string;
  standSlug: string;
  qrDataUrl: string;
  paymentBrands: PaymentBrand[];
}) {
  return (
    <section className="flex flex-wrap items-center gap-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="flex shrink-0 flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="" className="size-28" />
        {paymentBrands.length > 0 ? (
          <PaymentIconRow brands={paymentBrands} />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">QR code</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Print or download anytime. Icons reflect Checkout payments.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/dashboard/businesses/${standId}/qr`}
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Open print page
          </Link>
          <a
            href={qrDataUrl}
            download={`${standSlug}-qr.png`}
            className="underline"
          >
            Download PNG
          </a>
        </div>
      </div>
    </section>
  );
}
