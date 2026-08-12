import Link from "next/link";
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
import MarketingPageShell from "@/components/MarketingPageShell";
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
        upsellLabel={content.heroUpsellLabel ?? null}
        upsellDetail={content.heroUpsellDetail ?? null}
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
      {content.doorwayLinks && content.doorwayLinks.length > 0 ? (
        <section className="px-5 pb-12 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
              {content.doorwaySectionHeading ?? "Built for"}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.doorwayLinks.map((d) => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    className="flex h-full flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--leaf)]"
                  >
                    <span className="font-semibold text-[var(--field)]">
                      {d.label}
                    </span>
                    <span className="text-sm text-[var(--muted)]">{d.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
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
