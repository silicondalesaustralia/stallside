import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { MONTHLY_FEE_CENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { Role } from "@/generated/prisma/client";
import AlertSettingsForm from "./AlertSettingsForm";

export default async function SettingsPage() {
  const { user, owner } = await requireOwner();

  return (
    <main className="flex max-w-xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[var(--muted)]">Account and billing for your farm stand business.</p>
      </div>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Account</h2>
        <p>Signed in as {user.email}</p>
        <p>Business: {owner.businessName}</p>
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Alerts</h2>
        <p className="text-sm text-[var(--muted)]">
          Sales and low-stock alerts. Push alerts use a 6-hour cooldown per product on
          the phone app.
        </p>
        <AlertSettingsForm
          contactEmail={owner.contactEmail}
          emailAlertsEnabled={owner.emailAlertsEnabled}
          pushAlertsEnabled={owner.pushAlertsEnabled}
          alertEmails={owner.alertEmails}
        />
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Billing</h2>
        <p>
          Cash plan: {formatMoney(MONTHLY_FEE_CENTS, "AUD")}/mo per site (collection coming). No
          transaction fees. Card / PayPal plan coming soon.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-lg font-semibold">Stripe Connect</h2>
        <p>
          Status:{" "}
          {owner.stripeChargesEnabled
            ? "Charges enabled - card & Tap & Go live"
            : owner.stripeAccountId
              ? "Onboarding incomplete"
              : "Not connected"}
        </p>
        <Link
          href="/dashboard/settings/stripe"
          className="inline-flex rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Manage Stripe connection
        </Link>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-lg font-semibold">PayPal Connect</h2>
        <p>
          Status:{" "}
          {owner.paypalPaymentsEnabled
            ? "Payments enabled - PayPal checkout live"
            : owner.paypalMerchantId
              ? "Onboarding incomplete"
              : "Not connected"}
        </p>
        <Link
          href="/dashboard/settings/paypal"
          className="inline-flex rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--wash)]"
        >
          Manage PayPal connection
        </Link>
      </section>
    </main>
  );
}
