import Link from "next/link";
import SquareProviderForm from "../../settings/square/SquareProviderForm";

export default function CheckoutProviderSection({
  current,
  squarePaymentsReady,
  stripeReady,
  feeApplies,
  activeOfferCount,
}: {
  current: string;
  squarePaymentsReady: boolean;
  stripeReady: boolean;
  feeApplies: boolean;
  activeOfferCount: number;
}) {
  return (
    <section id="checkout-provider" className="space-y-3 text-sm scroll-mt-8">
      <h2 className="text-lg font-semibold">Product checkout provider</h2>
      <p className="text-[var(--muted)]">
        Choose Stripe or Square for one-off card checkout on products and
        pre-orders. Memberships and subscriptions always use Stripe, so keep
        Stripe connected if you sell them. Free plan still collects a 2.5% Vendl
        fee on Vendl-originated Square checkout
        {feeApplies ? " (your account)" : " (waived on Pro)"}. Square POS sales
        never incur a Vendl fee.
      </p>
      {activeOfferCount > 0 && !stripeReady ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
          You have {activeOfferCount} active membership
          {activeOfferCount === 1 ? "" : "s"} or subscription
          {activeOfferCount === 1 ? "" : "s"}. Customers can&apos;t sign up
          until Stripe is connected.{" "}
          <Link href="/dashboard/settings/stripe" className="underline">
            Connect Stripe
          </Link>
        </p>
      ) : null}
      <SquareProviderForm
        current={current}
        squarePaymentsReady={squarePaymentsReady}
        stripeReady={stripeReady}
      />
    </section>
  );
}
