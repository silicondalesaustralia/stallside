import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { richTextToPlainOrNull } from "@/lib/website/rich-text/plain";
import { graphIds, money } from "./graph/clean";
import type { PageSeo } from "./graph/page-graph";

const BILLING: Record<string, string> = { WEEKLY: "P1W", FORTNIGHTLY: "P2W", MONTHLY: "P1M" };

type Offer = {
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  interval: string;
};

/** A subscription box / membership: a Product whose Offer bills every week, fortnight or month. */
export function subscriptionPageSeo(ctx: NonNullable<StorefrontContext>, offer: Offer): PageSeo {
  const description = richTextToPlainOrNull(offer.description);
  const currency = ctx.stand.currency;
  return {
    path: `/subscriptions/${encodeURIComponent(offer.slug)}`,
    type: "ItemPage",
    name: offer.title,
    description,
    imageUrl: offer.imageUrl,
    breadcrumb: [
      { label: ctx.branding.headline, path: "/" },
      { label: "Memberships", path: "/subscriptions" },
      { label: offer.title },
    ],
    nodes: [
      ({ facts, pageUrl }) => ({
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name: offer.title,
        description: description ?? undefined,
        image: offer.imageUrl ?? undefined,
        url: pageUrl,
        brand: { "@type": "Brand", name: facts.name },
        offers: {
          "@type": "Offer",
          url: pageUrl,
          price: money(offer.priceCents),
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
          seller: { "@id": graphIds(facts.homeUrl, pageUrl).business },
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: money(offer.priceCents),
            priceCurrency: currency,
            billingDuration: BILLING[offer.interval] ?? "P1W",
          },
        },
      }),
    ],
  };
}
