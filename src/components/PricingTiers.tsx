"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
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
      <p className="mb-4 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
        This is what you pay to run Stallside - not your customers. Shoppers never pay a fee:
        they scan your QR, pick what they&apos;re taking, and pay at the stand.
      </p>

      <div
        className="mb-8 flex flex-wrap gap-2"
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
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--field)] hover:border-[var(--leaf)]"
            }`}
          >
            {code}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <div className="rounded-[var(--radius)] border-2 border-[var(--leaf)] bg-[var(--panel)] p-[var(--pad-lg)]">
          <p className="text-sm font-semibold text-[var(--leaf)]">Cash - live</p>
          <p className="mt-3 font-receipt text-4xl font-semibold text-[var(--marigold)]">
            {formatMoney(cashPlanCents(currency), currency)}
            <span className="text-base font-normal text-[var(--muted)]"> /mo per site</span>
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Take cash. Track stock. Print QR posters. Sale and low-stock alerts.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Set up in two minutes. No paperwork, no bank details.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Start free - 30 days
          </Link>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)]">
          <p className="text-sm font-semibold text-[var(--ink)]">
            Card / PayPal -{" "}
            <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
              Coming soon
            </span>
          </p>
          <p className="mt-3 font-receipt text-4xl font-semibold text-[var(--marigold)]">
            {formatMoney(cardPlanCents(currency), currency)}
            <span className="text-base font-normal text-[var(--muted)]"> /mo per site</span>
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Everything in Cash, plus Tap &amp; Go, Apple Pay, Google Pay, and PayPal at your gate.
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--marigold)]">
            No terminal. No hardware. No percentage of your sales.
          </p>
          <a
            href="mailto:hello@stallside.app?subject=Card%20%2F%20PayPal%20plan%20waitlist"
            className="mt-8 inline-flex rounded-[var(--radius-pill)] border border-[var(--field)] px-5 py-3 text-sm font-semibold text-[var(--field)] transition hover:bg-[var(--wash)]"
          >
            Join the waitlist
          </a>
        </div>
      </div>

      <p className="mt-8 text-sm text-[var(--muted)]">
        Owner plans only. Customers pay nothing to Stallside - just scan and pay at the stand.
        30 days free. Cancel any time. No transaction fees, on either plan, ever. Prices shown in{" "}
        {currency}; billed in the currency you choose at signup.
      </p>
    </section>
  );
}
