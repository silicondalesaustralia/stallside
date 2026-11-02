import Link from "next/link";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { STALLSIDE_FEE_BPS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { cardPlanCents, isBillingCurrency } from "@/lib/saas-pricing";
import { requireOwner } from "@/lib/session";
import ProBenefitCards from "./ProBenefitCards";
import ProComparisonTable from "./ProComparisonTable";
import { FREE_INCLUDES } from "./pro-benefits";

const BILLING_PATH = "/dashboard/settings/billing";

export default async function WhyProPage() {
  const { owner } = await requireOwner();
  const isPro = await ownerIdHasProAccess(owner.id);
  const currency = isBillingCurrency(owner.billingCurrency) ? owner.billingCurrency : "AUD";
  const priceCents = cardPlanCents(currency);
  const breakEvenCents = Math.ceil((priceCents * 10_000) / STALLSIDE_FEE_BPS / 100) * 100;
  const price = formatMoney(priceCents, currency);

  return (
    <main className="flex max-w-4xl flex-col gap-6 pb-12">
      <PageHeader
        title={isPro ? "You're on Vendl Pro" : "Why upgrade to Pro"}
        subtitle={
          isPro
            ? "Thanks for being on Pro. Here's everything your plan includes."
            : "Everything on Free, plus your own website, zero Vendl fees and the tools to grow."
        }
        actions={
          <Link href={BILLING_PATH} className={dashCtaClass}>
            {isPro ? "Manage billing" : "Upgrade to Pro"}
          </Link>
        }
      />

      {isPro ? null : (
        <section className="rounded-2xl bg-[var(--field)] p-6 text-[var(--ink-on-dark)]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--marigold)]">Vendl Pro</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            {price}
            <span className="text-base font-semibold opacity-80"> / month</span>
          </p>
          <p className="mt-2 max-w-xl text-sm opacity-85">
            Pro pays for itself once you take more than {formatMoney(breakEvenCents, currency)} a month in card
            payments, because you stop paying the {STALLSIDE_FEE_BPS / 100}% Vendl fee. Cancel anytime.
          </p>
          <Link
            href={BILLING_PATH}
            className="mt-4 inline-block rounded-full bg-[var(--marigold)] px-5 py-2.5 text-sm font-bold text-[var(--field)] hover:brightness-105"
          >
            Upgrade to Pro
          </Link>
        </section>
      )}

      <ProBenefitCards />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Free vs Pro</h2>
        <ProComparisonTable />
      </section>

      <section className="dash-card p-5">
        <h2 className="font-semibold">Still included on Free</h2>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-[var(--muted)] sm:grid-cols-2">
          {FREE_INCLUDES.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
