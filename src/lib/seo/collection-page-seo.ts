import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { richTextToPlainOrNull } from "@/lib/website/rich-text/plain";
import { itemListNode } from "./graph/content";
import { siteUrl, type PageSeo } from "./graph/page-graph";

type Ctx = NonNullable<StorefrontContext>;
type Linkable = { slug: string; name: string };

/** CollectionPage listing products (and optionally categories) as an ItemList. */
export function collectionPageSeo(
  ctx: Ctx,
  input: {
    path: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    trail?: { label: string; path?: string }[];
    products: Linkable[];
  },
): PageSeo {
  return {
    path: input.path,
    type: "CollectionPage",
    name: input.name,
    description: richTextToPlainOrNull(input.description),
    imageUrl: input.imageUrl,
    breadcrumb: [
      { label: ctx.branding.headline, path: "/" },
      ...(input.trail ?? []),
      { label: input.name },
    ],
    nodes: [
      (page) =>
        itemListNode(
          page.pageUrl,
          input.products.slice(0, 100).map((p) => ({
            name: p.name,
            url: siteUrl(page, `/products/${encodeURIComponent(p.slug)}`),
          })),
        ),
    ],
  };
}
