import Link from "next/link";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import QrSignSheet from "@/app/dashboard/(gated)/stands/[standId]/qr/QrSignSheet";
import { isStripeTestConfigured } from "@/lib/stripe-demo";

export default function DemoStandPanel({
  name,
  qrCallout,
  qrSignMessage,
  description,
  locationLabel,
  checkoutUrl,
  qrDataUrl,
  siteUrl,
  paymentBrands,
  cardDemoReady,
}: {
  name: string;
  qrCallout: string | null;
  qrSignMessage: string | null;
  description: string | null;
  locationLabel: string | null;
  checkoutUrl: string;
  qrDataUrl: string;
  siteUrl: string;
  paymentBrands: PaymentBrand[];
  cardDemoReady: boolean;
}) {
  const showTestCards = cardDemoReady && isStripeTestConfigured();

  return (
    <div className="flex flex-col gap-4">
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

      <Link
        href={checkoutUrl}
        className="inline-flex w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
      >
        Open checkout
      </Link>

      {showTestCards ? (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--ink)]">
          <p className="font-semibold text-[var(--field)]">
            Try Card with a Stripe test card
          </p>
          <p className="mt-1 text-[var(--muted)]">
            Use{" "}
            <span className="font-receipt text-[var(--ink)]">
              4242 4242 4242 4242
            </span>
            , any future expiry, any CVC. No real charge.
          </p>
        </div>
      ) : null}
    </div>
  );
}
