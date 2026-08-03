/** Owner explainer for automatic BNPL + PayTo at Stripe Checkout. */
export default function BnplExplainer({
  isPro,
  showPayTo = false,
}: {
  isPro: boolean;
  showPayTo?: boolean;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="font-semibold">
        Buy Now, Pay Later{showPayTo ? " and PayTo" : ""} (automatic)
      </p>
      <p className="text-[var(--muted)]">
        Your customers can pay in instalments on larger orders with Afterpay,
        Zip or Klarna. These appear automatically at checkout when the order is
        above the provider&apos;s minimum (usually around $30) and available in
        your country. Nothing to switch on.
      </p>
      {showPayTo ? (
        <p className="text-[var(--muted)]">
          Australian stands also get <strong>PayTo</strong> at Stripe Checkout
          (bank payment). PayTo can take a moment to clear - Stallside waits for
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
