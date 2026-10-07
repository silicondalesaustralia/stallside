export default function PaymentProviderGuide({ v2026 }: { v2026: boolean }) {
  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <h2 className="text-lg font-semibold">
        Which payment option is best for your business?
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>You can connect both.</strong>{" "}
          Pick one of them for everyday product and pre-order checkout. Subscriptions and memberships always
          run on Stripe.
        </li>
        <li>
          <strong>Stripe</strong> is required for subscriptions and memberships.
          It costs more per sale: the Free plan Vendl fee is 2.5%
          {v2026 ? " + 30c" : ""}, on top of Stripe&apos;s own processing fee.
        </li>
        <li>
          <strong>Square</strong> is usually cheaper: the Free plan Vendl fee is
          2.5% with no fixed per-sale charge, which matters on small orders. It
          also syncs stock both ways with Square POS, so it suits market and
          in-person sellers. Sales on your own Square reader never incur a Vendl
          fee.
        </li>
        <li>
          <strong>Vendl Pro removes the Vendl fee</strong> on Square and PayPal
          {v2026
            ? ", and on your first A$4,000 of Stripe sales each month (0.5% after that)"
            : " and Stripe"}
          . Stripe and Square still charge their own processing fees.
        </li>
        <li>
          <strong>Already have a Stripe or Square account?</strong>{" "}
          Connecting takes a minute: sign in and approve Vendl. If you don&apos;t have one,
          you&apos;ll go through their sign-up and identity checks first, which
          can take a little longer.
        </li>
      </ul>
    </section>
  );
}
