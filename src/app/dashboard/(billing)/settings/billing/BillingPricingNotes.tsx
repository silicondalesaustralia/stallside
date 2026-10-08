export default function BillingPricingNotes({
  v2026,
  isPaidPro,
  confirmError,
}: {
  v2026: boolean;
  isPaidPro: boolean;
  confirmError: boolean;
}) {
  return (
    <>
      <p className="mt-2 text-[var(--muted)]">
        {v2026
          ? "Free is $0/mo with all features. Stripe card sales carry a 2.5% + 30c Vendl fee; Square and PayPal carry 2.5% (plus standard processing fees). Pro removes the Vendl fee, with 0.5% on Stripe sales above A$4,000 a month."
          : "Free is $0/mo with all features. Card, Tap & Go and pay-later carry a 2.5% Vendl fee (plus standard Stripe processing fees). Pro removes the Vendl fee."}{" "}
        This is what you pay Vendl - not your customers' payments.
      </p>
      {confirmError ? (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Please tick the pricing confirmation before upgrading.
        </p>
      ) : null}
      {isPaidPro && !v2026 ? (
        <p className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          You&apos;re on our original Pro pricing. If you cancel, re-subscribing
          later moves you to current pricing.
        </p>
      ) : null}
    </>
  );
}
