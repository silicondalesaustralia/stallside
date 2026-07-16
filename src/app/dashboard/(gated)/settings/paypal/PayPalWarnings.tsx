import { paypalFeeDisplay } from "@/lib/paypal-rates";

export default function PayPalWarnings({
  billingCurrency,
}: {
  billingCurrency: string;
}) {
  const feeHint = paypalFeeDisplay(billingCurrency);

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm">
      <p className="font-semibold">Before you connect</p>
      <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
        <li>
          Use a <strong className="text-[var(--ink)]">PayPal Business</strong>{" "}
          account. Personal / Friends &amp; Family cannot take Goods &amp;
          Services and has no seller protection. Do not ask customers to pay as
          Friends &amp; Family to dodge fees — PayPal freezes accounts for that.
        </li>
        <li>
          US sellers: PayPal reports Goods &amp; Services income (1099-K). Confirm
          the current threshold with PayPal / IRS before you rely on a figure.
        </li>
        <li>
          PayPal&apos;s merchant fee comes out of your proceeds (owner-direct).
          Stallside does not take a Connect cut.
          {feeHint ? (
            <>
              {" "}
              Estimate for {billingCurrency}: {feeHint}.
            </>
          ) : (
            <> Fee rates vary by currency — confirm on PayPal&apos;s site.</>
          )}
        </li>
      </ul>
    </section>
  );
}
