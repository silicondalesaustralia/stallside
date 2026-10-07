import Link from "next/link";
import {
  formatAdminDate,
  type StripeConnectionRow,
} from "@/lib/admin-payment-connections";
import AdminConnectionFlag from "./AdminConnectionFlag";

function stripeState(r: StripeConnectionRow): { label: string; className: string } {
  if (r.stripeChargesEnabled) return { label: "Ready", className: "text-emerald-700" };
  if (r.stripeOnboardingComplete) return { label: "Restricted", className: "text-red-700" };
  return { label: "Not finished", className: "text-amber-700" };
}

export default function AdminStripeConnections({ rows }: { rows: StripeConnectionRow[] }) {
  const ready = rows.filter((r) => r.stripeChargesEnabled).length;
  return (
    <section className="dash-card p-5">
      <h2 className="text-lg font-semibold">Stripe</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {ready} can take payments of {rows.length} who started connecting.
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No sellers have started Stripe yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[var(--muted)]">
              <tr className="border-b border-[var(--line)]">
                <th className="py-2 pr-3 font-medium">Seller</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Account</th>
                <th className="py-2 pr-3 font-medium">Plan</th>
                <th className="py-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rows.map((r) => {
                const state = stripeState(r);
                return (
                  <tr key={r.id} className="align-top">
                    <td className="py-3 pr-3">
                      <Link href={`/admin/owners/${r.id}`} className="font-medium underline">
                        {r.businessName}
                      </Link>
                      <p className="text-[var(--muted)]">{r.user?.email ?? r.contactEmail}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className={state.className}>{state.label}</p>
                      {r.onlinePaymentProvider === "STRIPE" ? (
                        <p className="text-xs text-[var(--muted)]">Checkout provider</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-col gap-0.5">
                        <AdminConnectionFlag on={r.stripeOnboardingComplete} label="Details" />
                        <AdminConnectionFlag on={r.stripeChargesEnabled} label="Payments" />
                        <AdminConnectionFlag on={r.stripePayoutsEnabled} label="Payouts" />
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      {r.subscriptionPlan ?? "free"} · {r.billingCurrency}
                    </td>
                    <td className="py-3">{formatAdminDate(r.stripeConnectStartedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
