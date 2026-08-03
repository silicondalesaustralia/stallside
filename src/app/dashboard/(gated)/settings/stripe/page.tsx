import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";
import { billingRegionDisplay } from "@/lib/saas-pricing";
import { shouldChargeStallsideFee } from "@/lib/stallside-fee";
import { listConnectPaymentMethodToggles } from "@/lib/stripe-payment-method-config";
import { ensureRegionalConnectCapabilities } from "@/lib/stripe-connect-capabilities";
import { stripeConnectCountry } from "@/lib/stripe-connect-country";
import PassFeeToggle from "./PassFeeToggle";
import BnplExplainer from "./BnplExplainer";
import ConnectPaymentMethodToggles from "./ConnectPaymentMethodToggles";
import StripeAccountStatus from "./StripeAccountStatus";
import StripeConnectControls from "./StripeConnectControls";

export default async function StripeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; refresh?: string; disconnected?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const feeApplies = shouldChargeStallsideFee(owner);

  if (
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
  const billingRegion = billingRegionDisplay(owner.billingCurrency);

  let paymentMethods: Awaited<
    ReturnType<typeof listConnectPaymentMethodToggles>
  > = null;
  let paymentMethodsError: string | null = null;
  if (ready && owner.stripeAccountId && configured) {
    try {
      await ensureRegionalConnectCapabilities(
        owner.stripeAccountId,
        stripeConnectCountry(owner.billingCurrency),
      );
    } catch (error) {
      console.warn("Regional capability ensure failed", error);
    }
    try {
      paymentMethods = await listConnectPaymentMethodToggles(
        owner.stripeAccountId,
        owner.billingCurrency || "AUD",
      );
    } catch (error) {
      console.error("Failed to load Stripe payment methods", error);
      paymentMethodsError =
        "Could not load payment methods from Stripe. Try Refresh status.";
    }
  }

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
          Connect Stripe so stand customers can pay by card, Tap &amp; Go, and
          any other methods enabled on your Stripe account (such as PayTo or Buy
          Now, Pay Later). Payments go to your Stripe account. This is separate
          from your{" "}
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

      {started && !ready ? (
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

      <StripeAccountStatus
        accountId={owner.stripeAccountId}
        onboardingComplete={owner.stripeOnboardingComplete}
        chargesEnabled={ready}
        payoutsEnabled={owner.stripePayoutsEnabled}
        billingRegion={billingRegion}
      />

      {feeApplies ? (
        <PassFeeToggle passFeeToCustomer={owner.passFeeToCustomer} />
      ) : (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          Stallside Pro: no Stallside transaction fee on card sales. Standard
          Stripe processing fees still apply.
        </p>
      )}

      {paymentMethods && paymentMethods.methods.length > 0 ? (
        <ConnectPaymentMethodToggles
          configurationId={paymentMethods.configurationId}
          initialMethods={paymentMethods.methods}
        />
      ) : ready && configured ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          No checkout payment methods were returned from Stripe for this
          account yet. Try Refresh status, or manage methods in the Stripe
          dashboard.
        </p>
      ) : null}
      {paymentMethodsError ? (
        <p className="text-sm text-red-700">{paymentMethodsError}</p>
      ) : null}

      <BnplExplainer
        isPro={!feeApplies}
        showPayTo={(owner.billingCurrency || "AUD").toUpperCase() === "AUD"}
      />

      <StripeConnectControls
        configured={configured}
        ready={ready}
        started={started}
      />
    </main>
  );
}
