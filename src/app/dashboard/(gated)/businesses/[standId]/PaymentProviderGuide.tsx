export default function PaymentProviderGuide({
  weeklyPayouts,
}: {
  weeklyPayouts: boolean;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <h2 className="text-lg font-semibold">
        Which payment option is best for your business?
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>You can connect both.</strong>{" "}
          Pick one of them for everyday product, pre-order and deposit checkout. Subscriptions and
          memberships can run on either.
        </li>
        <li>
          <strong>Stripe</strong> works outside Australia and offers pay-later.
          The Free plan Vendl fee is 2.5%, on top of Stripe&apos;s own
          processing fee.{weeklyPayouts ? " Stripe payouts are weekly (Mondays)." : ""}
        </li>
        <li>
          <strong>Square</strong> has the same 2.5% Free plan Vendl fee, and
          Square pays out on its own schedule. It also syncs stock both ways
          with Square POS, so it suits market and in-person sellers. Sales on
          your own Square reader never incur a Vendl fee.
        </li>
        <li>
          <strong>Vendl Pro removes the Vendl fee</strong> on Square and Stripe.
          Stripe and Square still charge their own processing fees.
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
