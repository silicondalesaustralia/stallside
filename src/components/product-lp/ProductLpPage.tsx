import BusinessToolsSection from "@/components/BusinessToolsSection";
import LpClosingCta from "@/components/lp/LpClosingCta";
import LpCtaParamScript from "@/components/lp/LpCtaParamScript";
import LpHero from "@/components/lp/LpHero";
import LpHowItWorks from "@/components/lp/LpHowItWorks";
import LpMissedSale from "@/components/lp/LpMissedSale";
import LpMobileStickyCta from "@/components/lp/LpMobileStickyCta";
import LpObjections from "@/components/lp/LpObjections";
import LpPaymentStrip from "@/components/lp/LpPaymentStrip";
import LpPricing from "@/components/lp/LpPricing";
import LpProductProof from "@/components/lp/LpProductProof";
import LpTestimonial from "@/components/lp/LpTestimonial";
import LpTrustStrip from "@/components/lp/LpTrustStrip";
import MarketingDashboardSection from "@/components/MarketingDashboardSection";
import MarketingPageShell from "@/components/MarketingPageShell";
import ProductLpDoorways from "@/components/product-lp/ProductLpDoorways";
import ProductLpHeroVisual from "@/components/product-lp/ProductLpHeroVisual";
import type { ProductLpContent } from "@/lib/product-lp/types";

export default function ProductLpPage({
  content,
  bare = false,
}: {
  content: ProductLpContent;
  /** Ads /lp/ pages: no site header or footer. */
  bare?: boolean;
}) {
  const cta = content.ctaLabel;
  const href = content.signupHref;
  const dashCurrency = content.paymentMarket === "uk" ? "GBP" : "AUD";

  const body = (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--panel)] pb-20 md:pb-0">
      <LpHero
        eyebrow={content.eyebrow}
        headline={content.headline}
        support={content.support}
        chips={content.chips}
        ctaLabel={cta}
        signupHref={href}
        secondaryLabel={content.secondaryLabel}
        visual={
          <ProductLpHeroVisual
            variant={content.heroVisual}
            prices={content.heroPrices}
          />
        }
        featurePoints={content.heroFeaturePoints}
      />
      {content.showPaymentStrip !== false ? (
        <LpPaymentStrip market={content.paymentMarket} />
      ) : null}
      <LpTrustStrip
        heading={content.stripHeading}
        items={content.stripItems}
        footnote={content.stripFootnote}
      />
      {content.upsellHeading && content.upsellItems?.length ? (
        <LpTrustStrip
          heading={content.upsellHeading}
          items={content.upsellItems}
          footnote={content.upsellFootnote}
        />
      ) : null}
      <LpMissedSale
        eyebrow={content.problemEyebrow}
        headline={content.problemHeadline}
        body={content.problemBody}
        points={content.problemPoints}
        flow={content.problemFlow}
      />
      <LpHowItWorks
        heading={content.howHeading}
        support={content.howSupport}
        steps={content.steps}
        ctaLabel={cta}
        signupHref={href}
      />
      <MarketingDashboardSection
        currency={dashCurrency}
        standName={
          content.paymentMarket === "uk"
            ? "River Mill Bakery"
            : "Green Valley Eggs"
        }
      />
      <LpProductProof
        eyebrow={content.proofEyebrow}
        headline={content.proofHeadline}
        body={content.proofBody}
        benefits={content.proofBenefits}
        note={content.proofNote}
        panelTitle={content.proofPanelTitle}
        panelSubtitle={content.proofPanelSubtitle}
        stats={content.proofStats}
        recentTitle={content.proofRecentTitle}
        recentSub={content.proofRecentSub}
      />
      <BusinessToolsSection heading="Everything else you get" />
      {content.doorwayLinks ? (
        <ProductLpDoorways
          heading={content.doorwaySectionHeading}
          links={content.doorwayLinks}
        />
      ) : null}
      <LpObjections
        heading={content.objectionsHeading}
        support={content.objectionsSupport}
        items={content.objections}
      />
      <LpTestimonial
        quote={content.testimonialQuote}
        extra={content.testimonialExtra}
        cite={content.testimonialCite}
        place={content.testimonialPlace}
      />
      <LpPricing
        eyebrow={content.pricingEyebrow}
        headline={content.pricingHeadline}
        body={content.pricingBody}
        included={content.pricingIncluded}
        ctaLabel={cta}
        signupHref={href}
        fullPricingHref={content.pricingFullHref}
      />
      <LpClosingCta
        headline={content.closingHeadline}
        support={content.closingSupport}
        note={content.closingNote}
        ctaLabel={cta}
        signupHref={href}
      />
      <LpMobileStickyCta ctaLabel={cta} signupHref={href} />
      <LpCtaParamScript />
    </main>
  );

  if (bare) return body;
  return <MarketingPageShell>{body}</MarketingPageShell>;
}
