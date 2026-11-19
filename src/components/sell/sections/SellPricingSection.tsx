"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { HOME_FREE_PERKS, homeProPerks } from "@/lib/home-page-copy";
import {
  BILLING_CURRENCIES,
  BILLING_CURRENCY_STORAGE_KEY,
  cardPlanCents,
  detectBrowserBillingCurrency,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";

function planPrice(cents: number, currency: BillingCurrency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

const noSubscription = () => () => {};

function savedCurrency(): BillingCurrency {
  try {
    const stored = localStorage.getItem(BILLING_CURRENCY_STORAGE_KEY);
    if (stored && isBillingCurrency(stored)) return stored;
  } catch {
    /* ignore */
  }
  return detectBrowserBillingCurrency();
}

export default function SellPricingSection({
  nicheLabel,
  signupHref = "/signup",
}: {
  nicheLabel: string;
  signupHref?: string;
}) {
  const [picked, setPicked] = useState<BillingCurrency | null>(null);
  const detected = useSyncExternalStore(noSubscription, savedCurrency, () => "USD" as const);
  const currency = picked ?? detected;
  const freePerks = HOME_FREE_PERKS.slice(0, 3);
  const proPerks = homeProPerks(true).slice(0, 3);

  function selectCurrency(value: string) {
    if (!isBillingCurrency(value)) return;
    setPicked(value);
    try {
      localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <h2 className="center">
          Start free. Grow when you’re ready — {nicheLabel.toLowerCase()}.
        </h2>
        <label className="fine center space-top" style={{ display: "block" }}>
          Show prices in{" "}
          <select
            value={currency}
            onChange={(e) => selectCurrency(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            {BILLING_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <div className="plans">
          <article className="plan">
            <h3>Free</h3>
            <div className="price">
              {planPrice(0, currency)} <small>/ month</small>
            </div>
            <p className="fine">Your shop link and the tools to start selling.</p>
            <ul>
              {freePerks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <Link className="btn" href={signupHref}>
              Start free
            </Link>
          </article>
          <article className="plan pro">
            <h3>Vendl Pro</h3>
            <div className="price">
              {planPrice(cardPlanCents(currency), currency)} <small>/ month</small>
            </div>
            <p className="fine">Everything in Free, plus tools for your brand.</p>
            <ul>
              {proPerks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <Link className="btn" href="/#pricing">
              See current Pro pricing
            </Link>
          </article>
        </div>
        <p className="fine center space-top">
          Card processing and applicable platform fees are separate. Social and video
          allowances apply. See current pricing for your currency.
        </p>
      </div>
    </section>
  );
}
