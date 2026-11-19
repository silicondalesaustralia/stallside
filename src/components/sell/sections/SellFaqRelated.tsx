import Link from "next/link";
import type { SellMarket } from "@/lib/sell";

export default function SellFaqRelated({
  market,
  related,
}: {
  market: SellMarket;
  related: SellMarket[];
}) {
  return (
    <section className="section">
      <div className="wrap">
        <h2>Frequently asked questions.</h2>
        <div className="space-top">
          {market.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
        <h3 className="space-top">Explore more of what you make.</h3>
        <div className="related">
          {related.map((item) => (
            <Link key={item.slug} href={`/sell/${item.slug}`}>
              {item.label} →
            </Link>
          ))}
          <Link href="/sell">All maker businesses →</Link>
        </div>
      </div>
    </section>
  );
}
