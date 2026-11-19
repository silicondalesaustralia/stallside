import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import SellHeader from "@/components/sell/SellHeader";
import SellFooter from "@/components/sell/SellFooter";
import SellHeroPreview from "@/components/sell/sections/SellHeroPreview";
import SellPricingSection from "@/components/sell/sections/SellPricingSection";
import SellFaqRelated from "@/components/sell/sections/SellFaqRelated";
import SellImportBrands from "@/components/sell/SellImportBrands";
import {
  SellCalculatorSection,
  SellModesMarketingSection,
  SellOperationsSection,
  SellStorefrontSection,
} from "@/components/sell/sections/SellMarketSections";
import {
  buildSellMarketGraph,
  getCategory,
  getMarket,
  type SellMarket,
} from "@/lib/sell";
import { calcCtaLabel, MIGRATE_HEADING } from "@/lib/sell/exemplar-samples";
import { marketHeroImage } from "@/lib/sell/category-assets";

export default function SellMarketPage({ market }: { market: SellMarket }) {
  const category = getCategory(market.categoryId);
  const related = market.relatedSlugs
    .map((slug) => getMarket(slug))
    .filter((m): m is SellMarket => Boolean(m));
  const signupHref = `/signup?entry=sell-page&business_type=${encodeURIComponent(market.slug)}`;
  const calcCta = calcCtaLabel(market.slug, market.calculator.saleUnit);
  const migrateHeading =
    MIGRATE_HEADING[market.slug] ?? "Starting fresh or moving an existing shop?";
  const heroImg = marketHeroImage(market.slug, market.categoryId);

  return (
    <>
      <JsonLd data={buildSellMarketGraph(market)} />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SellHeader />
      <main id="main">
        <section
          className="hero candle-hero"
          style={
            {
              ["--sell-hero-image" as string]: `url('${heroImg}')`,
            } as React.CSSProperties
          }
        >
          <div
            className="hero-photo"
            role="img"
            aria-label={`${market.label} photography`}
            style={{ backgroundImage: `url('${heroImg}')` }}
          />
          <div className="wrap">
            <div className="crumb">
              <Link href="/">Home</Link> / <Link href="/sell">What you make</Link> /{" "}
              {market.label}
            </div>
            <div className="hero-body">
              <div className="hero-copy">
                <p className="fine" style={{ marginBottom: 8 }}>
                  {category?.label}
                </p>
                <h1>{market.hero.heading}</h1>
                <p className="lead">{market.hero.body}</p>
                <div className="actions">
                  <Link className="btn" href={signupHref}>
                    Start free
                  </Link>
                  <a className="btn outline" href="#calculator">
                    {calcCta}
                  </a>
                </div>
                <p className="fine">
                  Free shop link and selling tools. Website and costing with Pro.
                </p>
              </div>
              <SellHeroPreview market={market} />
            </div>
          </div>
        </section>

        <div className="trust">
          <div className="wrap">
            <i>Made by you. Backed by Vendl.</i>
            <span>▧ · Sell your products</span>
            <span>▱ · Know your costs</span>
            <span>▥ · Grow your business</span>
          </div>
        </div>

        <SellStorefrontSection market={market} />
        <SellCalculatorSection market={market} />
        <SellOperationsSection market={market} />
        <SellModesMarketingSection market={market} />

        <section className="section">
          <div className="wrap">
            <div className="import">
              <h3>{migrateHeading}</h3>
              <div>
                <p>Bring your products and customers to Vendl Pro.</p>
                <SellImportBrands />
                <p className="fine">
                  Imports move supported data, not your website design, pages or
                  subscriptions.
                </p>
              </div>
            </div>
            <div className="community">
              <strong>You make the products. Let’s build the business.</strong>
              <p>
                Practical lessons, other makers and help along the way.{" "}
                <Link href="/#community">
                  <u>Explore the community →</u>
                </Link>
              </p>
            </div>
          </div>
        </section>

        <SellPricingSection nicheLabel={market.label} signupHref={signupHref} />
        <SellFaqRelated market={market} related={related} />

        <section className="final">
          <h2>Give your next collection a place to sell.</h2>
          <p>
            Start with a free shop link. Add your own website and production tools with Pro.
          </p>
          <Link className="btn light" href={signupHref}>
            Start free
          </Link>
        </section>
      </main>
      <SellFooter />
    </>
  );
}
