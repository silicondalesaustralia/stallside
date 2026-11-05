import Link from "next/link";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { STALLSIDE_FEE_BPS } from "@/lib/constants";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { annualPlanCents, cardPlanCents, isBillingCurrency } from "@/lib/saas-pricing";
import { requireOwner } from "@/lib/session";
import { listProAnnualCurrencies } from "@/lib/stripe-pro-annual";
import ProComparisonTable from "./ProComparisonTable";
import ProDemos from "./ProDemos";
import ProFaq from "./ProFaq";
import ProFeatureAccordions from "./ProFeatureAccordions";
import ProFeaturedBenefits from "./ProFeaturedBenefits";
import ProFreeReassurance from "./ProFreeReassurance";
import ProPricingDecision from "./ProPricingDecision";
import ProUpgradeHero from "./ProUpgradeHero";
import ProUpgradePageView from "./ProUpgradePageView";
import FounderVideoSection from "@/components/FounderVideoSection";
import { PRO_VIDEO } from "@/lib/founder-videos";
import { proBenefitGroups } from "./pro-benefits";
import { BILLING_PATH, OPENING_CARDS, WEBSITE_OPENING_CARD, formatProMoney, proCheckoutHref } from "./why-pro-copy";

export default async function WhyProPage() {
  const { owner } = await requireOwner();
  const isPro = await ownerIdHasProAccess(owner.id);
  // Social designs and AI video clips launch with Pro, so they're presented as included for every owner.
  const socialReady = true;
  const currency = isBillingCurrency(owner.billingCurrency) ? owner.billingCurrency : "AUD";
  const monthlyCents = cardPlanCents(currency);
  const annualCents = listProAnnualCurrencies().includes(currency) ? annualPlanCents(currency) : null;
  const checkoutHref = proCheckoutHref(currency);
  const groups = proBenefitGroups(socialReady);
  const openingCards = OPENING_CARDS.map((card) => (card.social && !socialReady ? WEBSITE_OPENING_CARD : card));

  const comparison = (
    <section aria-labelledby="pro-compare-heading" className="flex flex-col gap-3">
      <h2 id="pro-compare-heading" className="text-xl font-semibold">
        Free vs Pro
      </h2>
      <ProComparisonTable groups={groups} />
    </section>
  );

  if (isPro) {
    return (
      <main className="flex max-w-4xl flex-col gap-8 pb-12">
        <PageHeader
          title="You're on Vendl Pro"
          subtitle="Thanks for being on Pro. Here's everything your plan includes."
          actions={
            <Link href={BILLING_PATH} className={dashCtaClass}>
              Manage billing
            </Link>
          }
        />
        <ProFeaturedBenefits socialReady={socialReady} checkoutHref={null} />
        <ProFeatureAccordions groups={groups} />
        {comparison}
        <ProFaq />
      </main>
    );
  }

  return (
    <main className="flex max-w-4xl flex-col gap-10 pb-12">
      <ProUpgradePageView currency={currency} />
      <ProUpgradeHero cards={openingCards} monthlyPrice={formatProMoney(monthlyCents, currency)} checkoutHref={checkoutHref} />
      <FounderVideoSection
        heading="Why We Built Vendl Pro"
        description="Hear why Vendl Pro was created to help makers understand their costs, price their products and promote what they make."
        video={PRO_VIDEO}
        eventPrefix="pro"
        action={
          <a href="#pro-demos" className="text-sm font-semibold text-[var(--leaf-dark)] underline underline-offset-4">
            Explore Pro features
          </a>
        }
      />
      <ProDemos
        currency={currency}
        feeBps={STALLSIDE_FEE_BPS}
        monthlyCents={monthlyCents}
        annualCents={annualCents}
        socialReady={socialReady}
        checkoutHref={checkoutHref}
      />
      <ProFeaturedBenefits socialReady={socialReady} checkoutHref={checkoutHref} />
      <ProFeatureAccordions groups={groups} />
      {comparison}
      <ProFreeReassurance socialReady={socialReady} />
      <ProPricingDecision currency={currency} monthlyCents={monthlyCents} annualCents={annualCents} />
      <ProFaq />
    </main>
  );
}
