import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { STRIPE_CHECKOUT_METHODS_PHRASE } from "@/lib/stripe-connect-copy";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import { STRIPE_CHECKOUT_BRANDS } from "@/lib/payment-brand-assets";
import {
  squareEligibleBillingCurrency,
} from "@/lib/commerce/payment-rail";
import { getSquareConnection } from "@/lib/square/connection";
import { isSquareConnectEnabled } from "@/lib/square/config";

export default async function PaymentsSettingsPage() {
  const { owner } = await requireOwner();
  const paypalConnectAvailable = isPayPalConnectAvailable();
  const showSquare = squareEligibleBillingCurrency(owner.billingCurrency);
  const squareEnvReady = isSquareConnectEnabled();
  const squareConn =
    showSquare && squareEnvReady ? await getSquareConnection(owner.id) : null;
  const squareActive = squareConn?.status === "ACTIVE";

  return (
    <main className="flex w-full max-w-3xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-2 text-[var(--muted)]">
          Connect how shoppers pay online. Australian accounts can use Stripe or
          Square for cards (pick one as the live provider). Other regions use
          Stripe.
        </p>
      </div>

      <section id="stripe" className="space-y-3 text-sm scroll-mt-8">
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          <PaymentBrandIcon brand="stripe" className="size-6" />
          Card / Tap &amp; Go
          <PaymentIconRow brands={STRIPE_CHECKOUT_BRANDS} />
        </h2>
        <p>
          Status:{" "}
          {owner.stripeChargesEnabled
            ? "Connected · charges enabled"
            : owner.stripeAccountId
              ? "Connected · finish setup"
              : "Not connected"}
        </p>
        <p className="text-[var(--muted)]">
          Connect Stripe for {STRIPE_CHECKOUT_METHODS_PHRASE}. Funds go to your
          account. Free includes a 2.5% Vendl fee on card sales unless you
          upgrade to Pro.
          {showSquare
            ? " Or connect Square below and choose it as your online card provider."
            : null}
        </p>
        <Link
          href="/dashboard/settings/stripe"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
        >
          <PaymentBrandIcon brand="stripe" className="size-5" />
          {owner.stripeChargesEnabled
            ? "Manage Stripe"
            : owner.stripeAccountId
              ? "Finish Stripe setup"
              : "Connect Stripe"}
        </Link>
      </section>

      {showSquare ? (
        <section id="square" className="space-y-3 text-sm scroll-mt-8">
          <h2 className="text-lg font-semibold">Square</h2>
          <p>
            Status:{" "}
            {!squareEnvReady
              ? "Available for Australia · waiting on Square app credentials in this environment"
              : squareActive
                ? squareConn?.paymentsEnabled
                  ? "Connected · payments enabled"
                  : "Connected · finish setup"
                : squareConn
                  ? squareConn.status
                  : "Not connected"}
          </p>
          <p className="text-[var(--muted)]">
            Connect Square for website payments and POS inventory sync. Choose
            Stripe or Square as your online card provider — not both at once.
            Free still collects 2.5% on Vendl-originated Square checkout; POS
            sales never take a Vendl fee.
          </p>
          <Link
            href="/dashboard/settings/square"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
          >
            {!squareEnvReady
              ? "Open Square settings"
              : squareActive
                ? "Manage Square"
                : "Connect Square"}
          </Link>
        </section>
      ) : null}

      <section id="paypal" className="space-y-3 text-sm scroll-mt-8">
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          <PaymentBrandIcon brand="paypal" className="size-6" />
          PayPal
          {paypalConnectAvailable ? (
            <PaymentIconRow brands={["paypal", "venmo"]} />
          ) : null}
        </h2>
        <p>
          Status:{" "}
          {!paypalConnectAvailable
            ? "Coming soon"
            : owner.paypalPaymentsEnabled && owner.paypalOnboardingComplete
              ? "Connected · offering at checkout"
              : owner.paypalMerchantId
                ? owner.paypalOnboardingComplete
                  ? "Connected · turn on for checkout"
                  : "Connected · finish setup"
                : "Not connected"}
        </p>
        <p className="text-[var(--muted)]">
          {paypalConnectAvailable
            ? "Connect PayPal so shoppers can pay with PayPal (and Venmo on USD stands). Funds go to your PayPal Business account. Free includes a 2.5% Vendl fee unless you upgrade to Pro."
            : "PayPal Connect is coming soon. Card payments via Stripe are live today."}
        </p>
        <Link
          href="/dashboard/settings/paypal"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
        >
          <PaymentBrandIcon brand="paypal" className="size-5" />
          {!paypalConnectAvailable
            ? "PayPal settings"
            : owner.paypalPaymentsEnabled && owner.paypalOnboardingComplete
              ? "Manage PayPal"
              : owner.paypalMerchantId
                ? "Finish PayPal setup"
                : "Connect PayPal"}
        </Link>
      </section>
    </main>
  );
}
