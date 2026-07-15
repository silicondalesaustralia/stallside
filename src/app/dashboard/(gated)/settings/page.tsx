import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { MONTHLY_FEE_CENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { Role } from "@/generated/prisma/client";
import AlertSettingsForm from "./AlertSettingsForm";
import BusinessNameForm from "./BusinessNameForm";

export default async function SettingsPage() {
  const { user, owner } = await requireOwner();

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

      <section className="space-y-3 text-sm opacity-55">
        <h2 className="text-lg font-semibold">
          Stripe payments (Connect){" "}
          <span className="text-sm font-medium text-[var(--muted)]">· Coming soon!</span>
        </h2>
        <p>Status: Not connected</p>
        <p className="text-[var(--muted)]">
          Connect your Stripe so stand customers can pay you by card / Tap &amp; Go.
        </p>
        <span
          aria-disabled
          className="inline-flex cursor-not-allowed rounded-lg border border-[var(--line)] bg-[var(--wash)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)]"
        >
          Coming soon!
        </span>
      </section>

      <section className="space-y-3 text-sm opacity-55">
        <h2 className="text-lg font-semibold">
          PayPal Connect{" "}
          <span className="text-sm font-medium text-[var(--muted)]">· Coming soon!</span>
        </h2>
        <p>Status: Not connected</p>
        <span
          aria-disabled
          className="inline-flex cursor-not-allowed rounded-lg border border-[var(--line)] bg-[var(--wash)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)]"
        >
          Coming soon!
        </span>
      </section>
    </main>
  );
}
