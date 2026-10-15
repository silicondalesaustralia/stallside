import type { StorefrontContext } from "@/lib/catalogue/storefront";
import type { PublicProductCard } from "@/lib/public-product";
import { richTextToPlainOrNull } from "@/lib/website/rich-text/plain";
import { graphIds, money } from "./graph/clean";
import type { PageSeo } from "./graph/page-graph";
import { collectionPageSeo } from "./collection-page-seo";

type Ctx = NonNullable<StorefrontContext>;

/**
 * A food menu becomes a schema.org Menu linked from the business (`hasMenu`);
 * pre-order drops and pages are product collections.
 */
export function menuPageSeo(
  ctx: Ctx,
  input: {
    path: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    products: PublicProductCard[];
    isPreOrder: boolean;
  },
): PageSeo {
  if (input.isPreOrder) return collectionPageSeo(ctx, input);
  const trail = [{ label: "Menus", path: "/menus" }];
  const currency = ctx.stand.currency;
  return {
    path: input.path,
    name: input.name,
    description: richTextToPlainOrNull(input.description),
    imageUrl: input.imageUrl,
    breadcrumb: [{ label: ctx.branding.headline, path: "/" }, ...trail, { label: input.name }],
    nodes: [
      ({ facts, pageUrl }) => ({
        "@type": "Menu",
        "@id": `${pageUrl}#menu`,
        name: input.name,
        url: pageUrl,
        description: richTextToPlainOrNull(input.description) ?? undefined,
        mainEntityOfPage: { "@id": graphIds(facts.homeUrl, pageUrl).webpage },
        provider: { "@id": graphIds(facts.homeUrl, pageUrl).business },
        hasMenuItem: input.products.map((p) => ({
          "@type": "MenuItem",
          name: p.name,
          description: richTextToPlainOrNull(p.description) ?? undefined,
          image: p.imageUrl ?? undefined,
          offers: {
            "@type": "Offer",
            price: money(p.priceCents),
            priceCurrency: currency,
            availability: p.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          },
        })),
      }),
    ],
  };
}
