import Image from "next/image";
import type { SellMarket } from "@/lib/sell";
import { EXEMPLAR_SAMPLES } from "@/lib/sell/exemplar-samples";
import { marketHeroImage } from "@/lib/sell/category-assets";

export default function SellHeroPreview({ market }: { market: SellMarket }) {
  const samples = EXEMPLAR_SAMPLES[market.slug] ?? [
    market.example.productName,
    market.example.productName,
    market.example.productName,
  ];
  const img = marketHeroImage(market.slug, market.categoryId);

  return (
    <div className="visual hero-store">
      <div className="browser-bar">
        <span className="dots">•••</span>
        <span className="demo-label">Illustrative shop concept</span>
      </div>
      <div className="mini-store">
        <div className="store-title">
          {market.slug === "candles" ? "EMBER & EARTH" : market.example.storeLabel}
        </div>
        <div className="store-nav">Shop Collections About</div>
        <div className="shop-products">
          {samples.slice(0, 3).map((name) => (
            <div key={name} className="store-product">
              <Image
                src={img}
                alt="Illustrative product photography"
                width={200}
                height={180}
              />
              <p>
                {name}
                <br />
                Demo
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
