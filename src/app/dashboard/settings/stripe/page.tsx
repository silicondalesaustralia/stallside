import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";
import { refreshStripeStatus, startStripeConnect } from "./actions";

export default async function StripeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; refresh?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;

  if (params.return === "1" || params.refresh === "1") {
    await refreshStripeStatus();
  }

  const configured = isStripeConfigured();

  return (
    <main className="flex max-w-xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Stripe Connect</h1>
        <p className="mt-2 text-[var(--muted)]">
          Connect your Stripe account so customers can pay by card, Apple Pay, or
          Google Pay. Funds go to you - Stallside does not take a Connect cut in MVP.
        </p>
      </div>

      {!configured ? (
        <p className="text-sm text-red-700">
          Add <code className="rounded bg-black/5 px-1">STRIPE_SECRET_KEY</code> to{" "}
          <code className="rounded bg-black/5 px-1">.env</code> to enable Connect.
        </p>
      ) : null}

      <section className="space-y-2 text-sm rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <p>
          Account:{" "}
          {owner.stripeAccountId ? (
            <code className="text-xs">{owner.stripeAccountId}</code>
          ) : (
            "Not connected"
          )}
        </p>
        <p>Onboarding complete: {owner.stripeOnboardingComplete ? "Yes" : "No"}</p>
        <p>Charges enabled: {owner.stripeChargesEnabled ? "Yes" : "No"}</p>
        <p>Payouts enabled: {owner.stripePayoutsEnabled ? "Yes" : "No"}</p>
      </section>

      <div className="flex flex-wrap gap-3">
        <form action={startStripeConnect}>
          <button
            type="submit"
            disabled={!configured}
            className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
          >
            {owner.stripeAccountId ? "Continue Stripe setup" : "Connect Stripe"}
          </button>
        </form>
        {owner.stripeAccountId ? (
          <form action={refreshStripeStatus}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold"
            >
              Refresh status
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
