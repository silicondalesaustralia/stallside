import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { MONTHLY_FEE_CENTS, PLATFORM_FEE_BPS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { Role } from "@/generated/prisma/client";

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

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Alerts</h2>
        <p>
          Sales and low-stock alerts go to <strong>{owner.contactEmail}</strong>
          {". "}
          On the Stallside phone app, allow notifications for a ding on each sale and when stock hits
          its threshold (6-hour cooldown per product).
        </p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Billing (planned)</h2>
        <p>
          SaaS: {formatMoney(MONTHLY_FEE_CENTS, "AUD")}/month · Platform fee:{" "}
          {PLATFORM_FEE_BPS / 100}% on card sales only (tracked; not skimmed via Connect yet).
        </p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">Stripe Connect</h2>
        <p>
          Status:{" "}
          {owner.stripeChargesEnabled
            ? "Charges enabled — card & Tap & Go live"
            : owner.stripeAccountId
              ? "Onboarding incomplete"
              : "Not connected"}
        </p>
        <Link
          href="/dashboard/settings/stripe"
          className="inline-block text-[var(--leaf-dark)] underline"
        >
          Manage Stripe connection
        </Link>
      </section>
    </main>
  );
}
