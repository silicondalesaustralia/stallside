"use client";

import { useState, useSyncExternalStore } from "react";
import HomePlanFeaturesModal from "@/components/home/HomePlanFeaturesModal";
import HomePriceCard from "@/components/home/HomePriceCard";
import { HOME_EYEBROW, HOME_H2, HOME_WRAP } from "@/components/home/home-styles";
import { HOME_FREE_PERKS, homeProPerks } from "@/lib/home-page-copy";
import { freePlanFeatures, proPlanFeatures } from "@/lib/home-plan-features";
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
  } catch (error) {
    console.warn("Could not read saved billing currency", error);
  }
  return detectBrowserBillingCurrency();
}

export default function HomePricing({ showSocial }: { showSocial: boolean }) {
  const [picked, setPicked] = useState<BillingCurrency | null>(null);
  const detected = useSyncExternalStore(noSubscription, savedCurrency, () => "AUD" as const);
  const currency = picked ?? detected;
  const [featuresPlan, setFeaturesPlan] = useState<"free" | "pro" | null>(null);

  function selectCurrency(value: string) {
    if (!isBillingCurrency(value)) return;
    setPicked(value);
    try {
      localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, value);
    } catch (error) {
      console.warn("Could not save billing currency", error);
    }
  }

  return (
    <section id="pricing" className={`${HOME_WRAP} scroll-mt-6 py-16 md:pb-[90px] md:pt-[100px]`}>
      <div className="mb-7 items-end justify-between gap-9 md:mb-10 md:flex">
        <div>
          <p className={HOME_EYEBROW}>ROOM TO START. ROOM TO GROW.</p>
          <h2 className={HOME_H2}>
            Start free.
            <br />
            Make it yours.
          </h2>
        </div>
        <label className="mt-6 flex items-center gap-3 text-xs text-[var(--field)] md:mt-0">
          Show prices in
          <select
            value={currency}
            onChange={(e) => selectCurrency(e.target.value)}
            className="rounded border border-[var(--line)] bg-transparent px-3.5 py-2 text-[var(--field)]"
          >
            {BILLING_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <HomePriceCard
          plan="FREE"
          title="Your first step."
          price={planPrice(0, currency)}
          summary="Your shop link and the tools to start selling."
          perks={HOME_FREE_PERKS}
          fee="2.5% Vendl fee on card, Tap & Go and pay-later payments. Cash and local bank payments have no Vendl fee. Payment processing fees apply separately."
          cta="Start free"
          onSeeAll={() => setFeaturesPlan("free")}
        />
        <HomePriceCard
          plan="VENDL PRO"
          title="Your business, together."
          price={planPrice(cardPlanCents(currency), currency)}
          summary="Everything in Free, plus tools for what’s next."
          perks={homeProPerks(showSocial)}
          fee="No Vendl transaction fee. Payment processing fees still apply. Domain purchases cost extra."
          cta="Get started"
          featured
          onSeeAll={() => setFeaturesPlan("pro")}
        />
      </div>
      <HomePlanFeaturesModal
        open={featuresPlan === "free"}
        onClose={() => setFeaturesPlan(null)}
        plan="FREE"
        title="Everything in Free"
        intro={`${planPrice(0, currency)} a month, for as long as you like.`}
        groups={freePlanFeatures(showSocial)}
      />
      <HomePlanFeaturesModal
        open={featuresPlan === "pro"}
        onClose={() => setFeaturesPlan(null)}
        plan="VENDL PRO"
        title="Everything in Pro"
        intro={`Every Free feature, plus all of this for ${planPrice(cardPlanCents(currency), currency)} a month.`}
        groups={proPlanFeatures(showSocial)}
      />
    </section>
  );
}
