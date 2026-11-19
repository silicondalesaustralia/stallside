import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import SellHeader from "@/components/sell/SellHeader";
import SellFooter from "@/components/sell/SellFooter";
import SellDirectoryOpen from "@/components/sell/SellDirectoryOpen";
import SellHubBrowse from "@/components/sell/SellHubBrowse";
import SellHubEssentials from "@/components/sell/SellHubEssentials";
import SellImportBrands from "@/components/sell/SellImportBrands";
import { buildSellHubGraph, getPublishedMarkets } from "@/lib/sell";

const HUB_FAQS = [
  {
    q: "Is Vendl only for home businesses?",
    a: "No. Vendl is for independent makers and small production businesses working in kitchens, studios or workshops.",
  },
  {
    q: "Do I need a website to start?",
    a: "Free provides a shop link. Pro adds a full website and custom-domain connection.",
  },
  {
    q: "What if my product is not listed?",
    a: "Choose the closest category or start free and add the products you make. Your product range does not need to fit one category.",
  },
] as const;

export default function SellHub() {
  const markets = getPublishedMarkets();

  return (
    <>
      <JsonLd data={buildSellHubGraph(markets)} />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SellHeader />
      <SellDirectoryOpen />
      <main id="main">
        <SellHubBrowse />
        <SellHubEssentials />

        <section className="section">
          <div className="wrap">
            <h2>From your kitchen, studio or workshop.</h2>
            <p className="sub">
              Built for independent makers, growing brands and small production teams.
            </p>
            <div className="three workspace">
              <Image
                src="/sell/assets/bread.jpg"
                alt="Artisan bread"
                width={640}
                height={420}
              />
              <Image
                src="/sell/assets/textiles.jpg"
                alt="A creative workspace"
                width={640}
                height={420}
              />
              <Image
                src="/sell/assets/home.jpg"
                alt="Handmade homewares"
                width={640}
                height={420}
              />
            </div>
            <div className="import">
              <h3>Already have a shop?</h3>
              <div>
                <p>Bring your products and customers to Vendl Pro.</p>
                <SellImportBrands />
                <p className="fine">
                  Imports move supported data, not your website design, pages or
                  subscriptions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2>A few things you might be wondering.</h2>
            <div className="space-top">
              {HUB_FAQS.map((faq) => (
                <details key={faq.q}>
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="final">
          <h2>Whatever you make, make it your business.</h2>
          <p>
            Start with a free shop link. Add your own website and production tools with Pro.
          </p>
          <Link className="btn light" href="/signup">
            Start free
          </Link>
        </section>
      </main>
      <SellFooter />
    </>
  );
}
