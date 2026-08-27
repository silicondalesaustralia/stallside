import Link from "next/link";
import {
  CASH_AND_LOCAL_PAYMENTS_LABEL,
  CASH_AND_LOCAL_PAYMENTS_PHRASE,
  STRIPE_CHECKOUT_METHODS_PHRASE,
} from "@/lib/stripe-connect-copy";

type TapAndGoSetupCardProps = {
  cardTier: boolean;
  stripeConnected: boolean;
  stripeStarted: boolean;
  urgent?: boolean;
};

/** Prompt to finish or start Connect for card checkout, pre-orders, and subs. */
export default function TapAndGoSetupCard({
  cardTier: _cardTier,
  stripeConnected,
  stripeStarted,
  urgent = false,
}: TapAndGoSetupCardProps) {
  if (stripeConnected) return null;

  const border = urgent
    ? "border-amber-200 bg-amber-50"
    : "border-[var(--line)] bg-[var(--wash)]";
  const titleClass = urgent ? "text-amber-950" : "text-[var(--ink)]";
  const bodyClass = urgent ? "text-amber-950/80" : "text-[var(--muted)]";

  return (
    <section className={`rounded-[var(--radius)] border p-5 ${border}`}>
      <h2 className={`text-lg font-semibold ${titleClass}`}>
        {urgent
          ? "Finish Stripe setup to take card payments"
          : "Optional: card, pre-orders & subscriptions"}
      </h2>
      <p className={`mt-2 text-sm ${bodyClass}`}>
        {stripeStarted
          ? "Stripe Connect is started but charges are not enabled yet. Finish onboarding so you can take card at checkout, pre-orders, and subscription boxes."
          : `${CASH_AND_LOCAL_PAYMENTS_LABEL} work without Stripe. Connect when you want ${STRIPE_CHECKOUT_METHODS_PHRASE} — required for pre-orders and subscriptions.`}
      </p>
      <Link
        href="/dashboard/settings/stripe"
        className="mt-4 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
      >
        {stripeStarted ? "Continue Stripe setup" : "Connect Stripe (optional)"}
      </Link>
    </section>
  );
}
