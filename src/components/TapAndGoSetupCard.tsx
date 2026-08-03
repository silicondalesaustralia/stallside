import Link from "next/link";

type TapAndGoSetupCardProps = {
  cardTier: boolean;
  stripeConnected: boolean;
  stripeStarted: boolean;
};

/** Dashboard prompt: finish Connect for Tap & Go (all plans). */
export default function TapAndGoSetupCard({
  cardTier: _cardTier,
  stripeConnected,
  stripeStarted,
}: TapAndGoSetupCardProps) {
  if (stripeConnected) return null;

  return (
    <section className="rounded-[var(--radius)] border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-lg font-semibold text-amber-950">
        Finish setup to accept cards
      </h2>
      <p className="mt-2 text-sm text-amber-950/80">
        {stripeStarted
          ? "Stripe Connect is started but charges are not enabled yet. Continue onboarding so customers can use Card / Tap & Go."
          : "Connect Stripe so Card / Tap & Go payments go straight to you."}
      </p>
      <Link
        href="/dashboard/settings/stripe"
        className="mt-4 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
      >
        {stripeStarted ? "Continue Stripe setup" : "Connect Stripe"}
      </Link>
    </section>
  );
}
