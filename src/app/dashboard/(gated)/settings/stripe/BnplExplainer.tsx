/** Owner explainer for Stripe Checkout payment methods. */
export default function BnplExplainer({
  isPro,
  showPayTo = false,
}: {
  isPro: boolean;
  showPayTo?: boolean;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="font-semibold">Fees and delayed payments</p>
      <p className="text-[var(--muted)]">
        Toggles above write straight to Stripe. Checkout uses that same Stripe
        config, so off means hidden on the next payment session.
      </p>
      <p className="text-[var(--muted)]">
        Buy Now, Pay Later options still only show when the order is above the
        provider&apos;s minimum (usually around $30). Pre-orders are card-only.
      </p>
      {showPayTo ? (
        <p className="text-[var(--muted)]">
          <strong>PayTo</strong> can take a moment to clear. Stallside waits for
          Stripe&apos;s confirmation webhook before marking the sale paid and
          updating stock.
        </p>
      ) : null}
      <p className="text-[var(--muted)]">
        Pay-later providers charge a higher processing fee than cards, taken
        from your payment the same way a card fee is.
        {isPro
          ? " On Pro there is no Stallside fee on these sales."
          : " On Free, the Stallside 2.5% fee applies as usual."}
      </p>
    </section>
  );
}
