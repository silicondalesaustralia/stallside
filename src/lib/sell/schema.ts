import { SITE_URL } from "@/lib/legal";
import {
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/schema";
import type { SellMarket } from "./types";

function softwareNode() {
  return {
    ...softwareApplicationSchema(),
    "@type": ["SoftwareApplication", "WebApplication"] as const,
    description:
      "Commerce and production tools for businesses making products from ingredients, materials or parts.",
  };
}

export function buildSellHubGraph(markets: SellMarket[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      softwareNode(),
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/sell#webpage`,
        url: `${SITE_URL}/sell`,
        name: "Sell What You Make Online — Tools for Makers | Vendl",
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/sell#markets` },
        breadcrumb: { "@id": `${SITE_URL}/sell#breadcrumb` },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/sell#markets`,
        name: "Maker businesses supported by Vendl",
        numberOfItems: markets.length,
        itemListElement: markets.map((market, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/sell/${market.slug}#webpage`,
            url: `${SITE_URL}/sell/${market.slug}`,
            name: market.label,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/sell#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "What you make",
            item: `${SITE_URL}/sell`,
          },
        ],
      },
    ],
  };
}

export function buildSellMarketGraph(market: SellMarket) {
  const path = `/sell/${market.slug}`;
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      softwareNode(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: market.seo.title,
        description: market.seo.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/#software` },
        about: { "@type": "Thing", name: `Selling ${market.label.toLowerCase()} online` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "What you make",
            item: `${SITE_URL}/sell`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: market.label,
            item: url,
          },
        ],
      },
    ],
  };
}
