"use client";

import { useState } from "react";
import MakersLpChooseProLink from "@/components/lp/makers/MakersLpChooseProLink";
import MakersLpCurrencySelect from "@/components/lp/makers/MakersLpCurrencySelect";
import MakersLpIntervalToggle from "@/components/lp/makers/MakersLpIntervalToggle";
import MakersLpPlanFeaturesModal from "@/components/lp/makers/MakersLpPlanFeaturesModal";
import MakersLpPriceCard from "@/components/lp/makers/MakersLpPriceCard";
import MakersLpSignupLink from "@/components/lp/makers/MakersLpSignupLink";
import { useMakersLpCurrency } from "@/components/lp/makers/makers-lp-currency";
import { HOME_BUTTON_GOLD, HOME_BUTTON_OUTLINE, HOME_EYEBROW, HOME_H2, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { trackMakersLpEvent } from "@/lib/makers-lp";
import {
  MAKERS_LP_FREE_FEE,
  MAKERS_LP_FREE_PERKS,
  MAKERS_LP_PRO_FEE,
  MAKERS_LP_PRO_PERKS,
} from "@/lib/makers-lp-page-copy";
import { freePlanFeatures, proPlanFeatures } from "@/lib/makers-lp-plan-features";
import { formatLpPrice, lpAnnualNote, lpProAnnual, lpProMonthly } from "@/lib/makers-lp-price";
import type { BillingCurrency, BillingInterval } from "@/lib/saas-pricing";

type Plan = "free" | "pro";

type Props = { showSocial: boolean; annualCurrencies: readonly BillingCurrency[] };

export default function MakersLpPricing({ showSocial, annualCurrencies }: Props) {
  const { currency } = useMakersLpCurrency();
  const [featuresPlan, setFeaturesPlan] = useState<Plan | null>(null);
  const [interval, setBillingInterval] = useState<BillingInterval>("month");
  const showAnnual = annualCurrencies.includes(currency);
  const yearly = showAnnual && interval === "year";
  const freePrice = formatLpPrice(0, currency);
  const proPrice = yearly ? lpProAnnual(currency) : lpProMonthly(currency);
  const proPeriod = yearly ? "year" : "month";

  function openFeatures(plan: Plan) {
    setFeaturesPlan(plan);
    trackMakersLpEvent("lp_compare_open", { plan });
  }

  function changeInterval(next: BillingInterval) {
    setBillingInterval(next);
    trackMakersLpEvent("lp_billing_toggle", { interval: next, currency });
  }

  return (
    <section id="pricing" className={`${HOME_WRAP} scroll-mt-6 pb-16 pt-14 md:pb-[90px] md:pt-16`}>
      <div className="mb-7 items-end justify-between gap-9 md:mb-10 md:flex">
        <div>
          <p className={HOME_EYEBROW}>PRICING</p>
          <h2 className={HOME_H2}>Start Free. Grow with Vendl Pro.</h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {showAnnual ? <MakersLpIntervalToggle interval={interval} onChange={changeInterval} /> : null}
          <MakersLpCurrencySelect />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <MakersLpPriceCard
          plan="VENDL FREE"
          title="Start selling"
          price={freePrice}
          perks={MAKERS_LP_FREE_PERKS}
          fee={MAKERS_LP_FREE_FEE}
          seeAllLabel="See everything in Free"
          onSeeAll={() => openFeatures("free")}
          action={
            <MakersLpSignupLink placement="pricing-free" className={HOME_BUTTON_OUTLINE}>
              Start free <span aria-hidden>↗</span>
            </MakersLpSignupLink>
          }
        />
        <MakersLpPriceCard
          plan="VENDL PRO"
          title="Run more of your business"
          price={proPrice}
          period={proPeriod}
          priceNote={yearly ? lpAnnualNote(currency) : undefined}
          perks={MAKERS_LP_PRO_PERKS}
          fee={MAKERS_LP_PRO_FEE}
          seeAllLabel="See everything in Pro"
          featured
          onSeeAll={() => openFeatures("pro")}
          action={
            <MakersLpChooseProLink placement="pricing-pro" yearly={yearly} className={HOME_BUTTON_GOLD}>
              Choose Pro <span aria-hidden>↗</span>
            </MakersLpChooseProLink>
          }
        />
      </div>
      <p className="mt-6 max-w-[760px] text-sm text-[var(--muted)]">
        Fixed prices for your region, billed {showAnnual ? "monthly or yearly" : "monthly"} in the currency shown. Payment-provider fees (Stripe, Square or
        PayPal) are charged by your provider on both plans and are separate from Vendl’s fee.
      </p>
      <MakersLpPlanFeaturesModal
        open={featuresPlan === "free"}
        onClose={() => setFeaturesPlan(null)}
        plan="VENDL FREE"
        title="Everything in Free"
        intro={`${freePrice} a month, for as long as you like.`}
        groups={freePlanFeatures(showSocial)}
      />
      <MakersLpPlanFeaturesModal
        open={featuresPlan === "pro"}
        onClose={() => setFeaturesPlan(null)}
        plan="VENDL PRO"
        title="Everything in Pro"
        intro={`Every Free feature, plus all of this for ${proPrice} a ${proPeriod}.`}
        groups={proPlanFeatures(showSocial)}
      />
    </section>
  );
}
