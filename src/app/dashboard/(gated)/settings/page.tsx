import Link from "next/link";
import { isPlatformAdminEmail, requireOwner } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { billingRegionDisplay } from "@/lib/saas-pricing";
import { stallsideSubscriptionSummary } from "@/lib/stallside-subscription-summary";
import BusinessNameForm from "./BusinessNameForm";
import BillingRegionForm from "./BillingRegionForm";
import DeleteAccountButton from "./DeleteAccountButton";

export default async function SettingsPage() {
  const { user, owner } = await requireOwner();
  const subscriptionLine = stallsideSubscriptionSummary(owner, {
    email: user.email,
    role: user.role,
    lifetimeAccess: owner.lifetimeAccess,
  });
  const billingRegion = billingRegionDisplay(owner.billingCurrency);

  return (
    <main className="flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[var(--muted)]">
          Account and billing for your Vendl account (all businesses).
        </p>
      </div>

      <section className="space-y-3 text-sm">
        <h2 className="text-lg font-semibold">Account</h2>
        <p>Signed in as {user.email}</p>
        <BusinessNameForm businessName={owner.businessName} />
        {isPlatformAdminEmail(user.email) ? (
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
        <div className="pt-4">
          <DeleteAccountButton />
        </div>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-[var(--muted)]">
          Sales and low-stock alerts live under Notifications.
        </p>
        <Link
          href="/dashboard/notifications"
          className="inline-flex text-[var(--leaf-dark)] underline"
        >
          Open notifications
        </Link>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Owner guides</h2>
        <p className="text-[var(--muted)]">
          How-tos for businesses, QR, stock, alerts, and billing.
        </p>
        <Link
          href="/dashboard/knowledge"
          className="inline-flex text-[var(--leaf-dark)] underline"
        >
          Open guides
        </Link>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-lg font-semibold">Vendl subscription</h2>
        <p>{subscriptionLine}</p>
        <p>
          Current region: <strong>{billingRegion}</strong>
        </p>
        <p className="text-[var(--muted)]">
          Pays Vendl for the app. Also sets your Stripe Connect country for card
          payments. Australia can use Stripe or Square; other regions use Stripe.
          Separate from stand display currency.
        </p>
        <BillingRegionForm
          billingCurrency={owner.billingCurrency ?? "AUD"}
          stripeConnected={Boolean(owner.stripeAccountId)}
        />
        <Link
          href="/dashboard/settings/billing"
          className="inline-flex rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Manage subscription
        </Link>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Payments</h2>
        <p className="text-[var(--muted)]">
          Connect Stripe
          {(owner.billingCurrency ?? "AUD").toUpperCase() === "AUD"
            ? ", Square,"
            : ""}{" "}
          and PayPal under Payments.
        </p>
        <Link
          href="/dashboard/settings/payments"
          className="inline-flex rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
        >
          Open payments
        </Link>
      </section>
    </main>
  );
}
