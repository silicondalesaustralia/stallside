import Link from "next/link";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import QrSignSheet from "@/app/dashboard/(gated)/stands/[standId]/qr/QrSignSheet";
import type { DemoRegion } from "@/lib/demo";

export default function DemoStandPanel({
  name,
  region,
  qrCallout,
  qrSignMessage,
  description,
  locationLabel,
  checkoutUrl,
  qrDataUrl,
  siteUrl,
  paymentBrands,
}: {
  name: string;
  region: DemoRegion;
  qrCallout: string | null;
  qrSignMessage: string | null;
  description: string | null;
  locationLabel: string | null;
  checkoutUrl: string;
  qrDataUrl: string;
  siteUrl: string;
  paymentBrands: PaymentBrand[];
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <QrSignSheet
        name={name}
        qrCallout={qrCallout}
        qrSignMessage={qrSignMessage}
        description={description}
        locationLabel={locationLabel}
        checkoutUrl={checkoutUrl}
        qrDataUrl={qrDataUrl}
        siteUrl={siteUrl}
        paymentBrands={paymentBrands}
        className="rounded-[var(--radius)] border border-[var(--line)]"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={`/demo/phone?region=${region}`}
          className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
        >
          Try checkout on phone as a customer
        </Link>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--field)]"
        >
          Open checkout full screen as a customer
        </a>
      </div>
      <p className="text-center text-sm text-[var(--muted)]">
        Scan the QR on your real phone as a customer, or open the desktop phone
        demo — then see the sale alert on the stall owner&apos;s phone.
      </p>
    </div>
  );
}
