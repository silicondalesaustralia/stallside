/** Owner explainer for automatic BNPL at Stripe Checkout. */
export default function BnplExplainer({ isPro }: { isPro: boolean }) {
  return (
    <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="font-semibold">
        Buy Now, Pay Later (Afterpay, Zip, Klarna)
      </p>
      <p className="text-[var(--muted)]">
        Your customers can pay in instalments on larger orders. These appear
        automatically at checkout when the order is above the provider&apos;s
        minimum (usually around $30) and available in your country. Nothing to
        switch on — it&apos;s automatic.
      </p>
      <p className="text-[var(--muted)]">
        Pay-later providers charge a higher processing fee than cards, taken
        from your payment the same way a card fee is.
        {isPro
          ? " On Pro there is no Stallside fee on these sales."
          : " On the Free plan, the Stallside fee applies as usual — and you can pass fees to customers using the toggle above."}
      </p>
    </section>
  );
}
