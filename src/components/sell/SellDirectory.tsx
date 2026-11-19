"use client";

import Link from "next/link";
import { SELL_CATEGORIES, getMarketsByCategory } from "@/lib/sell";

export default function SellDirectory() {
  return (
    <details className="directory" id="directory">
      <summary>All 120 maker businesses</summary>
      <div className="directory-grid">
        {SELL_CATEGORIES.map((category) => {
          const markets = getMarketsByCategory(category.id);
          return (
            <section
              key={category.id}
              className="directory-group"
              id={`all-${category.id}`}
            >
              <h3>{category.label}</h3>
              {markets.map((market) => (
                <Link
                  key={market.slug}
                  data-market={market.slug}
                  href={`/sell/${market.slug}`}
                >
                  {market.label}
                </Link>
              ))}
            </section>
          );
        })}
      </div>
    </details>
  );
}
