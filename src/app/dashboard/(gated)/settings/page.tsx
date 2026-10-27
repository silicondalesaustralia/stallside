import Link from "next/link";
import { isPlatformAdminEmail, requireOwner } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { billingRegionDisplay } from "@/lib/saas-pricing";
import { stallsideSubscriptionSummary } from "@/lib/stallside-subscription-summary";
import BusinessNameForm from "./BusinessNameForm";
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
        <h2 className="text-lg font-semibold">Tax</h2>
        <p className="text-[var(--muted)]">
          GST, VAT or sales tax registration, rate and tax-free products live under Tax.
        </p>
        <Link href="/dashboard/settings/tax" className="inline-flex text-[var(--leaf-dark)] underline">
          Open tax settings
        </Link>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-[var(--muted)]">
          Turn email and phone alerts on or off, and add extra alert emails.
        </p>
        <Link
          href="/dashboard/notifications#alert-settings"
          className="inline-flex text-[var(--leaf-dark)] underline"
        >
          Alert settings
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
          Billing region: <strong>{billingRegion}</strong>
        </p>
        <p className="text-[var(--muted)]">
          Pays Vendl for the app. Also sets your Stripe Connect country for
          Card / Tap &amp; Go. Separate from stand display currency.
        </p>
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
          Connect Stripe, Square or PayPal and choose how shoppers pay on the Payments page.
        </p>
        <Link href="/dashboard/payments" className="inline-flex text-[var(--leaf-dark)] underline">
          Open Payments
        </Link>
      </section>
    </main>
  );
}
