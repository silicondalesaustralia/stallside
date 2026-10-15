import type { StorefrontContext } from "@/lib/catalogue/storefront";
import JsonLd from "@/components/JsonLd";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { buildPageGraph, type PageSeo } from "@/lib/seo/graph/page-graph";
import { siteFactsFromContext } from "@/lib/seo/site-facts-from-context";

/** The page's schema.org graph; nothing for drafts and owner previews. */
export default async function StorefrontJsonLd({
  ctx,
  draft,
  seo,
}: {
  ctx: NonNullable<StorefrontContext>;
  draft?: boolean;
  seo?: PageSeo;
}) {
  if (draft || ctx.isDraftPreview) return null;
  const host = await loadPrimaryCustomHostname(ctx.storefront.id);
  return <JsonLd data={buildPageGraph(siteFactsFromContext(ctx, host), seo)} />;
}
