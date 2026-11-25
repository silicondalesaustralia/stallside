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
          Pick one as your product checkout provider for everyday card sales,
          pre-orders and deposits. Subscriptions and memberships run on Stripe by
          default; Square needs subscriptions turned on in Square settings.
        </li>
        <li>
          <strong>Stripe</strong>{" "}
          takes card, Tap &amp; Go and pay-later where available, in Australia,
          the US, the UK and Europe. On Free, Vendl adds 2.5% on top of Stripe&apos;s
          processing fee.
          {weeklyPayouts ? " Stripe pays out weekly, on Mondays." : ""}
        </li>
        <li>
          <strong>Square</strong>{" "}
          (Australia and US) takes card and wallet checkout and syncs stock both
          ways with Square POS — useful if you already sell with a Square reader.
          Same 2.5% Vendl fee on Free for Vendl checkouts; sales on your own Square
          reader never incur a Vendl fee.
        </li>
        <li>
          <strong>Vendl Pro removes the Vendl fee</strong>{" "}
          on Stripe and Square. Provider processing fees still apply.
        </li>
        <li>
          <strong>PayPal is a Pro extra.</strong>{" "}
          It shows as its own button at checkout beside Stripe or Square. Connect
          it above, then tick PayPal under Checkout payments. No Vendl fee;
          PayPal&apos;s fee comes out of each sale.
        </li>
        <li>
          <strong>Already have a Stripe or Square account?</strong>{" "}
          Sign in and approve Vendl — usually a minute. New accounts go through
          their sign-up and identity checks first.
        </li>
      </ul>
    </section>
  );
}
