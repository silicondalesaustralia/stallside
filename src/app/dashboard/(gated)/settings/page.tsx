import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { MONTHLY_FEE_CENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { Role } from "@/generated/prisma/client";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import AlertSettingsForm from "./AlertSettingsForm";
import BusinessNameForm from "./BusinessNameForm";

export default async function SettingsPage() {
  const { user, owner } = await requireOwner();
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
  });

  return (
    <main className="flex max-w-xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[var(--muted)]">Account and billing for your farm stand business.</p>
      </div>

      <section className="space-y-3 text-sm">
        <h2 className="text-lg font-semibold">Account</h2>
        <p>Signed in as {user.email}</p>
        <BusinessNameForm businessName={owner.businessName} />
        {user.role === Role.ADMIN ? (
          <p>
            <Link href="/admin" className="text-[var(--leaf-dark)] underline">
              Open platform admin
            </Link>
          </p>
        ) : null}
        <form action={logout}>
          <button type="submit" className="mt-2 text-[var(--leaf-dark)] underline">
            Sign out
          </button>
        </form>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Owner guides</h2>
        <p className="text-[var(--muted)]">
          How-tos for stands, QR, stock, alerts, and billing.
        </p>
        <Link
          href="/dashboard/knowledge"
          className="inline-flex text-[var(--leaf-dark)] underline"
        >
          Open guides
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Alerts</h2>
        <p className="text-sm text-[var(--muted)]">
          Sales and low-stock alerts. Low-stock phone push uses a 6-hour cooldown per
          product. Add Stallside to your Home Screen for reliable phone push.
        </p>
        <AlertSettingsForm
          contactEmail={owner.contactEmail}
          emailAlertsEnabled={owner.emailAlertsEnabled}
          pushAlertsEnabled={owner.pushAlertsEnabled}
          alertEmails={owner.alertEmails}
        />
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-lg font-semibold">Stallside subscription</h2>
        <p>
          Cash plan: {formatMoney(MONTHLY_FEE_CENTS, "AUD")}/mo. Status:{" "}
          {owner.subscriptionStatus.toLowerCase()}.
        </p>
        <p className="text-[var(--muted)]">
          Pays Stallside for the app. Separate from accepting customer payments.
        </p>
        <Link
          href="/dashboard/settings/billing"
          className="inline-flex rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Manage subscription
        </Link>
      </section>

      <section id="stripe" className="space-y-3 text-sm scroll-mt-8">
        {cardTier ? (
          <>
            <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
              <PaymentBrandIcon brand="stripe" className="size-6" />
              Card / Tap &amp; Go
              <PaymentIconRow brands={["card", "apple", "google"]} />
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
              Connect Stripe so customers can pay by card, Apple Pay, or Google
              Pay. Funds go to your account.
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
          </>
        ) : (
          <>
            <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
              <PaymentBrandIcon brand="stripe" className="size-6" />
              Accept cards / Tap &amp; Go
              <span className="text-sm font-medium text-[var(--muted)]">
                · Card plan
              </span>
            </h2>
            <p className="text-[var(--muted)]">
              Card, Apple Pay, and Google Pay at your gate. Join the waitlist from
              pricing, or ask us to enable Card on your account.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
            >
              View Card plan
            </Link>
          </>
        )}
      </section>

      {cardTier ? (
        <section className="space-y-3 text-sm">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
            <PaymentBrandIcon brand="paypal" className="size-6" />
            PayPal Connect
          </h2>
          <p>
            Status:{" "}
            {owner.paypalMerchantId
              ? owner.paypalPaymentsEnabled
                ? "Connected · offering at checkout"
                : owner.paypalOnboardingComplete
                  ? "Connected · off at checkout"
                  : "Connected · finish setup"
              : "Not connected"}
          </p>
          <p className="text-[var(--muted)]">
            Connect a PayPal Business account so customers can pay you with
            PayPal after scanning your Stallside QR. Funds go to you.
          </p>
          <Link
            href="/dashboard/settings/paypal"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
          >
            <PaymentBrandIcon brand="paypal" className="size-5" />
            {owner.paypalMerchantId ? "Manage PayPal" : "Connect PayPal"}
          </Link>
        </section>
      ) : (
        <section className="space-y-3 text-sm opacity-55">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
            <PaymentBrandIcon brand="paypal" className="size-6" />
            PayPal Connect{" "}
            <span className="text-sm font-medium text-[var(--muted)]">
              · Card plan
            </span>
          </h2>
          <p className="text-[var(--muted)]">
            PayPal checkout is on the Card plan. Upgrade when Card billing is
            live.
          </p>
        </section>
      )}
    </main>
  );
}
