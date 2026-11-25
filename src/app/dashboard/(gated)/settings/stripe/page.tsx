import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";
import { billingRegionDisplay } from "@/lib/saas-pricing";
import {
  feePassOnAllowed,
  ownerPassesFeeToCustomer,
  shouldChargeVendlFee,
} from "@/lib/stallside-fee";
import { isV2026Owner } from "@/lib/fee-v2026";
import { listConnectPaymentMethodToggles } from "@/lib/stripe-payment-method-config";
import { ensureRegionalConnectCapabilities } from "@/lib/stripe-connect-capabilities";
import { stripeConnectCountry } from "@/lib/stripe-connect-country";
import PassFeeToggle from "./PassFeeToggle";
import ConnectPaymentMethodToggles from "./ConnectPaymentMethodToggles";
import StripeAccountStatus from "./StripeAccountStatus";

export default async function StripeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; refresh?: string; disconnected?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const feeApplies = shouldChargeVendlFee(owner);

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
  const isAud = (owner.billingCurrency || "AUD").toUpperCase() === "AUD";

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
      const accountInvalid =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "account_invalid";
      paymentMethodsError = accountInvalid
        ? "Vendl can no longer reach this Stripe account (access was revoked or it was connected in a different Stripe mode). Disconnect Stripe below and connect again."
        : "Could not load payment methods from Stripe. Try Refresh status.";
    }
  }

  return (
    <main className="flex w-full max-w-3xl flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/payments" className="underline">
          Payments
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Card / Tap &amp; Go
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connect Stripe for card, Tap &amp; Go and other methods at checkout,
          on pre-orders and for subscriptions. Money goes to your Stripe
          account — separate from your{" "}
          <Link href="/dashboard/settings/billing" className="underline">
            Vendl plan
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
          Finish Stripe setup so charges are enabled. Until then, card checkout,
          pre-orders and subscriptions won&apos;t work.
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
        chargesEnabled={ready}
        payoutsEnabled={owner.stripePayoutsEnabled}
        billingRegion={billingRegion}
        configured={configured}
        started={started}
      />

      {feeApplies ? (
        <PassFeeToggle
          passFeeToCustomer={ownerPassesFeeToCustomer(owner)}
          allowPassOn={feePassOnAllowed(owner)}
          weeklyPayouts={isV2026Owner(owner)}
        />
      ) : (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          Vendl Pro: no Vendl fee on card sales.
          {isV2026Owner(owner) ? " Payouts are weekly (Mondays)." : ""} Stripe
          processing fees still apply.
        </p>
      )}

      {paymentMethods && paymentMethods.methods.length > 0 ? (
        <ConnectPaymentMethodToggles
          configurationId={paymentMethods.configurationId}
          initialMethods={paymentMethods.methods}
          isPro={!feeApplies}
          showPayTo={isAud}
        />
      ) : ready && configured ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          No checkout methods from Stripe yet. Try Refresh status, or manage
          methods in the Stripe dashboard.
        </p>
      ) : null}
      {paymentMethodsError ? (
        <p className="text-sm text-red-700">{paymentMethodsError}</p>
      ) : null}
    </main>
  );
}
