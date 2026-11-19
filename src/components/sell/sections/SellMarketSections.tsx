import Image from "next/image";
import type { SellMarket } from "@/lib/sell";
import { marketHeroImage } from "@/lib/sell/category-assets";
import SellCostingDemo from "@/components/sell/sections/SellCostingDemo";
import SellDashboardTabs from "@/components/sell/sections/SellDashboardTabs";
import SellModesMarketing from "@/components/sell/sections/SellModesMarketing";

export function SellStorefrontSection({ market }: { market: SellMarket }) {
  const img = marketHeroImage(market.slug, market.categoryId);
  return (
    <section className="section">
      <div className="wrap split">
        <div className="visual big-store">
          <div className="browser-bar">
            <span className="dots">•••</span>
            <span className="demo-label">Illustrative shop concept</span>
          </div>
          <div className="store-title">
            {market.slug === "candles" ? "EMBER & EARTH" : market.example.storeLabel}
          </div>
          <div className="store-nav">Shop Collections About</div>
          <div className="collection">
            <Image src={img} alt="Illustrative collection" width={640} height={360} />
            <div>
              <h3>{market.storefront.heading.replace(/\.$/, "")}</h3>
              <span>Explore the collection</span>
            </div>
          </div>
        </div>
        <div>
          <span className="badge">Pro</span>
          <h2>{market.storefront.heading}</h2>
          <ul className="feature-list">
            <li>Your own website and domain</li>
            <li>Products and options you sell</li>
            <li>Pages for your brand</li>
            <li>A shop that feels like you</li>
          </ul>
          <p className="fine space-top">{market.storefront.body}</p>
        </div>
      </div>
    </section>
  );
}

export function SellCalculatorSection({ market }: { market: SellMarket }) {
  const img = marketHeroImage(market.slug, market.categoryId);
  return (
    <section className="section" id="calculator">
      <div className="wrap split">
        <div>
          <span className="badge">Pro production tools</span>
          <h2>What does each {market.calculator.saleUnit} really cost?</h2>
          <p className="sub">
            Bring materials, packaging and your time into one calculation.
          </p>
          <Image
            className="calculator-photo"
            src={img}
            alt="Materials and finished products"
            width={640}
            height={360}
          />
        </div>
        <SellCostingDemo market={market} />
      </div>
    </section>
  );
}

export function SellOperationsSection({ market }: { market: SellMarket }) {
  return (
    <section className="section">
      <div className="wrap split">
        <div>
          <h2>{market.operations.heading}</h2>
          <p className="sub">{market.operations.body}</p>
          <ul className="feature-list">
            {market.operations.steps.map((step) => (
              <li key={step.featureId}>{step.title}</li>
            ))}
          </ul>
        </div>
        <SellDashboardTabs />
      </div>
    </section>
  );
}

export function SellModesMarketingSection({ market }: { market: SellMarket }) {
  return <SellModesMarketing market={market} />;
}
