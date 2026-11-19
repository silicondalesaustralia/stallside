import Image from "next/image";
import type { SellMarket } from "@/lib/sell";
import {
  marketingHeading,
  sellingModesHeading,
} from "@/lib/sell/build-market-copy";
import { marketHeroImage } from "@/lib/sell/category-assets";

const MODE_LABELS: Record<string, string> = {
  "pre-orders": "Pre-orders",
  subscriptions: "Subscriptions",
  bundles: "Bundles",
  "qr-checkout": "Markets & stalls",
  "stock-sales": "Stock sales",
  collections: "Collection releases",
};

const MODE_ICONS: Record<string, string> = {
  "pre-orders": "▣",
  subscriptions: "↻",
  bundles: "◇",
  "qr-checkout": "▧",
  "stock-sales": "▦",
  collections: "◇",
};

export default function SellModesMarketing({ market }: { market: SellMarket }) {
  const src = {
    slug: market.slug,
    label: market.label,
    saleUnit: market.calculator.saleUnit,
    variant: market.variant,
  };
  const img = marketHeroImage(market.slug, market.categoryId);

  return (
    <>
      <section className="section">
        <div className="wrap">
          <h2>{sellingModesHeading(src)}.</h2>
          <div className="four">
            {market.sellingModes.map((mode) => (
              <article key={mode.featureId} className="sell-mode">
                <div className="icon" aria-hidden="true">
                  {MODE_ICONS[mode.featureId] ?? "▣"}
                </div>
                <h3>{MODE_LABELS[mode.featureId] ?? mode.featureId}</h3>
                <p>{mode.example}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section pale marketing">
        <div className="wrap center">
          <h2>
            <span className="badge">Pro</span> {marketingHeading(src)}
          </h2>
          <p className="sub">
            Take what you have made and give customers a reason to come back.
          </p>
          <div className="three">
            <article>
              <div className="visual">
                <div className="social-top">● · Example post</div>
                <div className="social-photo">
                  <Image src={img} alt="Illustrative social post" width={400} height={360} />
                  <div>
                    <small>NEW</small>
                    <h3>{market.marketing.productName}</h3>
                  </div>
                </div>
                <div className="social-bottom" aria-hidden="true">
                  ♡ ↗ ▢
                </div>
              </div>
              <h3 className="caption">
                Create and schedule
                <br />
                social posts
              </h3>
            </article>
            <article>
              <div className="visual reel">
                <Image
                  src={img}
                  alt="Illustrative video cover, not a playable video"
                  width={400}
                  height={360}
                />
                <span className="play" aria-hidden="true">
                  ▷
                </span>
                <span
                  className="demo-label"
                  style={{ position: "absolute", top: 12, left: 12 }}
                >
                  Video cover concept
                </span>
              </div>
              <h3 className="caption">
                Make short videos
                <br />
                with captions
              </h3>
            </article>
            <article>
              <div className="visual">
                <div className="browser-bar">
                  <span className="dots">•••</span>
                  <span>Email concept</span>
                </div>
                <div className="email-preview">
                  <small>{market.example.storeLabel}</small>
                  <h3>
                    {market.marketing.emailExample.replace(/^Subject:\s*/i, "")}
                  </h3>
                  <Image
                    src={img}
                    alt="Illustrative product email"
                    width={320}
                    height={160}
                  />
                  <div className="email-line" />
                  <div className="email-line" style={{ width: "80%" }} />
                  <div className="email-cta">Shop now</div>
                </div>
              </div>
              <h3 className="caption">
                Email customers and
                <br />
                send restock alerts
              </h3>
            </article>
          </div>
          <p className="fine space-top">
            Illustrative content concepts. Email included with Pro. Social and video use
            credits.
          </p>
        </div>
      </section>
    </>
  );
}
