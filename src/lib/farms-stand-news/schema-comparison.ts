import type { NewsArticleMeta } from "./types";

export function appendComparisonNodes(
  graph: Record<string, unknown>[],
  article: NewsArticleMeta,
  postUrl: string,
) {
  const compared = article.comparedSoftware ?? [];
  for (const app of compared) {
    graph.push({
      "@type": "SoftwareApplication",
      "@id": `${postUrl}#${app.id}`,
      name: app.name,
      url: app.url,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: app.applicationSubCategory,
      operatingSystem: app.operatingSystem,
      description: app.description,
      featureList: app.featureList,
      offers: app.offers.map((offer) => ({
        "@type": "Offer",
        name: offer.name,
        price: offer.price,
        priceCurrency: offer.priceCurrency,
        url: offer.url,
        availability: "https://schema.org/InStock",
        description: offer.description,
        ...(offer.unitText
          ? {
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: offer.price,
                priceCurrency: offer.priceCurrency,
                unitText: offer.unitText,
                referenceQuantity: {
                  "@type": "QuantitativeValue",
                  value: 1,
                  unitCode: "MON",
                },
              },
            }
          : {}),
      })),
    });
  }

  if (compared.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${postUrl}#comparison`,
      name: `${article.title} — platforms compared`,
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: compared.length,
      itemListElement: compared.map((app, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: app.listLabel,
        item: { "@id": `${postUrl}#${app.id}` },
      })),
    });
  }

  if (article.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${postUrl}#faq`,
      isPartOf: { "@id": `${postUrl}#webpage` },
      mainEntity: article.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }
}
