import Link from "next/link";
import QrPaymentMethods from "@/components/QrPaymentMethods";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import { isStripeTestConfigured } from "@/lib/stripe-demo";

export default function DemoStandPanel({
  name,
  checkoutUrl,
  qrDataUrl,
  paymentBrands,
  cardDemoReady,
}: {
  name: string;
  checkoutUrl: string;
  qrDataUrl: string;
  paymentBrands: PaymentBrand[];
  cardDemoReady: boolean;
}) {
  const showTestCards = cardDemoReady && isStripeTestConfigured();

  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Demo stand
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)]">
        {name}
      </h2>

      <div className="mt-6 flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- QR is a data URL */}
        <img
          src={qrDataUrl}
          alt={`QR code for ${name}`}
          width={240}
          height={240}
          className="rounded-lg border border-[var(--line)] bg-white p-2"
        />
        <QrPaymentMethods brands={paymentBrands} />
        <Link
          href={checkoutUrl}
          className="inline-flex w-full max-w-sm items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
        >
          Open checkout
        </Link>
        <p className="max-w-sm break-all text-center text-xs text-[var(--muted)]">
          {checkoutUrl}
        </p>
      </div>

      {showTestCards ? (
        <div className="mt-6 rounded-lg border border-[var(--line)] bg-[var(--wash)] px-4 py-3 text-sm text-[var(--ink)]">
          <p className="font-semibold text-[var(--field)]">Try Card with a Stripe test card</p>
          <p className="mt-1 text-[var(--muted)]">
            Use <span className="font-receipt text-[var(--ink)]">4242 4242 4242 4242</span>,
            any future expiry, any CVC. No real charge.
          </p>
        </div>
      ) : null}
    </div>
  );
}
