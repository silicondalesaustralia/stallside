import Image from "next/image";
import Link from "next/link";
import { SELL_CATEGORIES, getMarket } from "@/lib/sell";
import { CATEGORY_IMAGES } from "@/lib/sell/category-assets";

export default function SellCategoryCards() {
  return (
    <div className="categories">
      {SELL_CATEGORIES.map((category) => (
        <article key={category.id} className="category" id={`cat-${category.id}`}>
          <Image
            src={CATEGORY_IMAGES[category.id] ?? "/sell/assets/bread.jpg"}
            alt={`${category.label} — illustrative photography`}
            width={480}
            height={280}
            sizes="(max-width: 650px) 100vw, (max-width: 950px) 50vw, 25vw"
          />
          <div className="category-body">
            <h3>{category.label}</h3>
            <ul>
              {category.previewSlugs.map((slug) => {
                const market = getMarket(slug);
                if (!market) return null;
                return (
                  <li key={slug}>
                    <Link href={`/sell/${slug}`}>
                      {market.label} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link className="all" href={`#all-${category.id}`}>
              View all {category.marketCount} →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
