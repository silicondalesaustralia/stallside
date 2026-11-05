"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import ContinueWithFreeLink from "./ContinueWithFreeLink";
import ProUpgradeLink from "./ProUpgradeLink";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";
import { DECISION_REMINDERS, PRO_GOLD_CTA, formatProMoney, proCheckoutHref } from "./why-pro-copy";

type Interval = "month" | "year";
type Props = { currency: string; monthlyCents: number; annualCents: number | null };

/** Monthly/annual choice (annual only when its Stripe price is configured) into the existing Billing checkout. */
export default function ProPricingDecision({ currency, monthlyCents, annualCents }: Props) {
  const [interval, setBillingInterval] = useState<Interval>("month");
  const yearly = annualCents !== null && interval === "year";
  const savingCents = annualCents === null ? 0 : monthlyCents * 12 - annualCents;

  function choose(next: Interval) {
    setBillingInterval(next);
    trackProUpgrade("pro_upgrade_billing_interval_select", { interval: next, currency });
  }

  return (
    <section aria-labelledby="pro-decision-heading" className="rounded-2xl bg-[var(--field)] p-6 text-[var(--ink-on-dark)] md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--marigold)]">Upgrade when you&apos;re ready</p>
      <h2 id="pro-decision-heading" className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
        More Tools for Your Making Business
      </h2>
      <p className="mt-2 max-w-2xl text-sm opacity-90">
        Unlock production costing, pricing tools, social marketing and no Vendl transaction fees on eligible payments.
      </p>
      {annualCents === null ? null : (
        <div role="group" aria-label="Billing period" className="mt-5 inline-flex rounded-full border border-white/25 p-1">
          {(["month", "year"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={interval === value}
              onClick={() => choose(value)}
              className={`min-h-10 rounded-full px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[var(--marigold)] ${
                interval === value ? "bg-[var(--marigold)] text-[var(--field)]" : "text-[var(--ink-on-dark)]"
              }`}
            >
              {value === "month" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold">
        {formatProMoney(yearly && annualCents !== null ? annualCents : monthlyCents, currency)}
        <span className="text-base font-semibold opacity-80"> / {yearly ? "year" : "month"}</span>
      </p>
      {yearly ? (
        <p className="text-sm opacity-90">
          Save {formatProMoney(savingCents, currency)} a year compared with 12 monthly payments.
        </p>
      ) : null}
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {DECISION_REMINDERS.map((item) => (
          <li key={item} className="flex gap-2">
            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--marigold)]" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <ProUpgradeLink href={proCheckoutHref(currency, yearly ? "year" : "month")} placement="decision" className={PRO_GOLD_CTA}>
          Upgrade to Pro
        </ProUpgradeLink>
        <ContinueWithFreeLink placement="decision" onDark />
      </div>
      <p className="mt-3 text-sm opacity-85">
        Cancel anytime. Pro access continues until the end of the paid subscription period. Payment provider fees still
        apply.
      </p>
    </section>
  );
}
