import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { refreshStripeStatus, startStripeConnect } from "./actions";
import StripeDisconnectButton from "./StripeDisconnectButton";

export default async function StripeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; refresh?: string; disconnected?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const params = await searchParams;
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
  });

  if (
    cardTier &&
    (params.return === "1" || params.refresh === "1") &&
    owner.stripeAccountId &&
    isStripeConfigured()
  ) {
    try {
      await syncStripeAccountStatus({
        ownerId: owner.id,
        stripeAccountId: owner.stripeAccountId,
      });
    } catch (error) {
      console.error("Stripe return sync failed", error);
    }
    redirect("/dashboard/settings/stripe");
  }

  const configured = isStripeConfigured();
  const ready = owner.stripeChargesEnabled;
  const started = Boolean(owner.stripeAccountId);

  return (
    <main className="flex max-w-xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Card / Tap &amp; Go
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Connect Stripe so stand customers can pay by card, Apple Pay, or Google
          Pay. Payments are deposited directly into your Stripe account — Stallside
          never holds the money. This is separate from your{" "}
          <Link href="/dashboard/settings/billing" className="underline">
            app subscription
          </Link>
          .
        </p>
      </div>

      {params.disconnected === "1" ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          Stripe disconnected. Card / Tap &amp; Go is off until you connect again.
        </p>
      ) : null}

      {!cardTier ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          Card / Tap &amp; Go is on the Card plan.{" "}
          <Link href="/dashboard/settings/billing?plan=card" className="underline">
            Subscribe to Card
          </Link>
          , then finish Stripe Connect here.
        </p>
      ) : null}

      {cardTier && started && !ready ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Finish Stripe setup so charges are enabled. Until then, customers will
          not see Card / Tap &amp; Go at checkout.
        </p>
      ) : null}

      {!configured ? (
        <p className="text-sm text-red-700">
          Add <code className="rounded bg-black/5 px-1">STRIPE_SECRET_KEY</code> to{" "}
          <code className="rounded bg-black/5 px-1">.env</code> to enable Connect.
        </p>
      ) : null}

      <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p>
          Account:{" "}
          {owner.stripeAccountId ? (
            <code className="text-xs">{owner.stripeAccountId}</code>
          ) : (
            "Not connected"
          )}
        </p>
        <p>Onboarding complete: {owner.stripeOnboardingComplete ? "Yes" : "No"}</p>
        <p>Charges enabled: {ready ? "Yes" : "No"}</p>
        <p>Payouts enabled: {owner.stripePayoutsEnabled ? "Yes" : "No"}</p>
      </section>

      {cardTier ? (
        <div className="flex flex-wrap gap-3">
          <form action={startStripeConnect}>
            <button
              type="submit"
              disabled={!configured}
              className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
            >
              {ready
                ? "Open Stripe dashboard link"
                : started
                  ? "Continue Stripe setup"
                  : "Connect Stripe"}
            </button>
          </form>
          {started ? (
            <form action={refreshStripeStatus}>
              <button
                type="submit"
                className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold"
              >
                Refresh status
              </button>
            </form>
          ) : null}
          {started ? <StripeDisconnectButton /> : null}
        </div>
      ) : null}
    </main>
  );
}
