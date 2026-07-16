import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import DemoPhoneCheckout from "@/components/DemoPhoneCheckout";
import QrSignSheet from "@/app/dashboard/(gated)/stands/[standId]/qr/QrSignSheet";
import { isStripeTestConfigured } from "@/lib/stripe-demo";

export default function DemoStandPanel({
  name,
  standSlug,
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
  standSlug: string;
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
    <div className="flex flex-col gap-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:items-start">
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
        <div className="lg:sticky lg:top-6">
          <DemoPhoneCheckout
            checkoutUrl={checkoutUrl}
            standName={name}
            standSlug={standSlug}
          />
        </div>
      </div>

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
            ,             any future expiry, any CVC. No real charge. Card opens in a new tab
            from the phone frame — the sale alert slides down when payment
            completes.
          </p>
        </div>
      ) : null}
    </div>
  );
}
