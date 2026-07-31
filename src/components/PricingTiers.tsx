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
        Starter is free forever. Pro adds Tap &amp; Go and more. Shoppers never
        pay a fee to Stallside.
      </p>

      <div
        className="mb-6 flex flex-wrap gap-2"
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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--leaf)]">Starter</p>
          <p className="mt-3 font-receipt text-3xl font-semibold text-[var(--marigold)] sm:text-4xl">
            Free
            <span className="text-base font-normal text-[var(--muted)]">
              {" "}
              forever
            </span>
          </p>
          <div className="mt-4">
            <PlanFeatureBlock plan="starter" currency={currency} />
          </div>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex rounded-[var(--radius-pill)] border border-[var(--field)] px-5 py-3 text-sm font-semibold text-[var(--field)] hover:bg-[var(--wash)]"
            >
              Start free
            </Link>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border-2 border-[var(--leaf)] bg-[var(--panel)] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--leaf)]">Stallside Pro</p>
          <p className="mt-3 font-receipt text-3xl font-semibold text-[var(--marigold)] sm:text-4xl">
            {formatMoney(cardPlanCents(currency), currency)}
            <span className="text-base font-normal text-[var(--muted)]">
              {" "}
              /mo per site
            </span>
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{FREE_TRIAL_BLURB}</p>
          <div className="mt-4">
            <PlanFeatureBlock plan="pro" currency={currency} />
          </div>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
            >
              Start free
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-[var(--muted)]">
        After the 30-day Pro trial you stay on Starter free forever unless you
        upgrade. Cancel Pro anytime. No transaction fees. Prices in {currency}.
      </p>
    </section>
  );
}
