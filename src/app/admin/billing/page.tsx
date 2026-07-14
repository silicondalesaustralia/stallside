import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getCashPlanPriceId, isStripeBillingConfigured } from "@/lib/stripe";
import { CASH_PLAN_CENTS, CARD_PLAN_CENTS, DEFAULT_CURRENCY } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { listPromoCodes } from "@/lib/list-promo-codes";
import AdminCouponForm from "@/components/AdminCouponForm";

export default async function AdminBillingPage() {
  await requireAdmin();
  const configured = isStripeBillingConfigured();
  let priceId = "";
  try {
    priceId = getCashPlanPriceId();
  } catch {
    priceId = "";
  }

  let promos: Awaited<ReturnType<typeof listPromoCodes>> = [];
  if (configured) {
    try {
      promos = await listPromoCodes();
    } catch (error) {
      console.error("Failed to list Stripe promotion codes", error);
    }
  }

  return (
    <main className="flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Billing &amp; coupons
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Platform SaaS plans and signup promo codes (Stripe Billing).
        </p>
      </div>

      <section className="space-y-2 text-sm rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <h2 className="text-lg font-semibold">Plans</h2>
        <p>
          Cash: {formatMoney(CASH_PLAN_CENTS, DEFAULT_CURRENCY)}/mo · Price ID:{" "}
          {priceId ? (
            <code className="text-xs">{priceId}</code>
          ) : (
            <span className="text-red-700">missing STRIPE_PRICE_ID_CASH</span>
          )}
        </p>
        <p className="text-[var(--muted)]">
          Card plan: {formatMoney(CARD_PLAN_CENTS, DEFAULT_CURRENCY)}/mo
          (coming soon — not collectable yet).
        </p>
        <p>
          Checkout allows promotion codes on{" "}
          <Link href="/dashboard/settings/billing" className="underline">
            owner billing
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Create signup coupon</h2>
        <AdminCouponForm disabled={!configured} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Promotion codes</h2>
        {promos.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">None yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {promos.map((p) => (
              <li key={p.id} className="flex justify-between gap-3 py-2">
                <span>
                  <code>{p.code}</code> · {p.summary}
                </span>
                <span className="text-[var(--muted)]">
                  {p.active ? "active" : "inactive"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
