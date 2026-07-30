"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlanFeatureBlock from "@/components/PlanFeatureBlock";
import { formatMoney } from "@/lib/money";
import { FREE_TRIAL_BLURB } from "@/lib/plan-copy";
import {
  BILLING_CURRENCIES,
  BILLING_CURRENCY_STORAGE_KEY,
  cardPlanCents,
  cashPlanCents,
  detectBrowserBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";

export default function PricingTiers() {
  const [currency, setCurrency] = useState<BillingCurrency>("AUD");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BILLING_CURRENCY_STORAGE_KEY);
      if (stored && (BILLING_CURRENCIES as readonly string[]).includes(stored)) {
        setCurrency(stored as BillingCurrency);
        return;
      }
    } catch {
      /* ignore */
    }
    setCurrency(detectBrowserBillingCurrency());
  }, []);

  function selectCurrency(next: BillingCurrency) {
    setCurrency(next);
    try {
      localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative mb-4">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Pricing for stall owners
        </h2>
      </div>
      <p className="mb-8 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
        This is what you pay to run Stallside - not your customers. Shoppers never pay a fee:
        they scan your QR, pick what they&apos;re taking, and pay at the stand.
      </p>

      <div className="relative overflow-hidden rounded-[var(--radius)] border-2 border-[var(--leaf)] bg-[var(--panel)]">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />

        <div className="border-b border-[var(--line)] p-[var(--pad-lg)] sm:p-10">
          <p className="pl-3 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
            Start here
          </p>
          <h3 className="mt-2 max-w-2xl pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
            30-day free trial
          </h3>
          <p className="mt-2 pl-3 font-receipt text-2xl font-semibold text-[var(--marigold)] sm:text-3xl">
            Free
            <span className="text-base font-normal text-[var(--muted)]">
              {" "}
              · full Card features · no card required
            </span>
          </p>
          <p className="mt-4 max-w-3xl pl-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {FREE_TRIAL_BLURB}
          </p>
          <div className="mt-8 pl-3">
            <Link
              href="/signup"
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
            >
              Start free - 30 days
            </Link>
          </div>
        </div>

        <div className="p-[var(--pad-lg)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Then choose a plan
          </p>
          <p className="mt-2 max-w-2xl text-base text-[var(--muted)]">
            After the trial, pick Cash or Card to keep your dashboard open.
          </p>

          <div
            className="mt-6 flex flex-wrap gap-2"
            role="group"
            aria-label="Billing currency"
          >
            {BILLING_CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => selectCurrency(code)}
                className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-semibold transition ${
                  currency === code
                    ? "border-[var(--leaf)] bg-[var(--leaf)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--field)] hover:border-[var(--leaf)]"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--wash)]/40 p-5 sm:p-6">
              <p className="text-sm font-semibold text-[var(--leaf)]">Cash - live</p>
              <p className="mt-3 font-receipt text-3xl font-semibold text-[var(--marigold)] sm:text-4xl">
                {formatMoney(cashPlanCents(currency), currency)}
                <span className="text-base font-normal text-[var(--muted)]">
                  {" "}
                  /mo per site
                </span>
              </p>
              <div className="mt-4">
                <PlanFeatureBlock plan="cash" currency={currency} />
              </div>
            </div>

            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--wash)]/40 p-5 sm:p-6">
              <p className="text-sm font-semibold text-[var(--leaf)]">
                Card / Tap &amp; Go - live
              </p>
              <p className="mt-3 font-receipt text-3xl font-semibold text-[var(--marigold)] sm:text-4xl">
                {formatMoney(cardPlanCents(currency), currency)}
                <span className="text-base font-normal text-[var(--muted)]">
                  {" "}
                  /mo per site
                </span>
              </p>
              <div className="mt-4">
                <PlanFeatureBlock plan="card" currency={currency} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Owner plans only. Customers pay nothing to Stallside. Cancel any time.
        No transaction fees, on either plan, ever. Prices shown in {currency}; billed in
        the currency you choose.
      </p>
    </section>
  );
}
