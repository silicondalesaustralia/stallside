import type { ReactNode } from "react";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import type { CommercePageKey, StudioCommerceContext } from "@/lib/studio/commerce-pages";
import { withCommerceContext } from "@/lib/studio/commerce-context";
import { studioPageNodes } from "@/lib/studio/storage";
import StudioPublicSections from "@/lib/studio/public-render";
import type { StudioMetadata } from "@/lib/studio/types";
import type { PageSeo } from "@/lib/seo/graph/page-graph";

/**
 * A commerce page (cart, order confirmation): the seller's saved layout when they have one,
 * else just the page's own block in the site theme, else the plain storefront layout.
 */
export default async function CommerceLayoutView({
  ctx,
  draft,
  activePage,
  pageKey,
  commerceContext,
  renderBlock,
  fallback,
  seo,
  after,
}: {
  ctx: NonNullable<StorefrontContext>;
  draft: boolean;
  activePage: string;
  pageKey: CommercePageKey;
  commerceContext: StudioCommerceContext;
  renderBlock: (metadata: StudioMetadata) => ReactNode;
  fallback: ReactNode;
  seo?: PageSeo;
  /** Shown below the page body, e.g. the go-to-cart bar. */
  after?: ReactNode;
}) {
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const metadata = studioCtx.active ? withCommerceContext(studioCtx.metadata, commerceContext) : undefined;
  const nodes = studioCtx.active ? studioPageNodes(studioCtx.studio, pageKey) : undefined;

  let body: ReactNode = fallback;
  if (metadata && nodes) body = <StudioPublicSections nodes={nodes} metadata={metadata} />;
  else if (metadata) body = renderBlock(metadata);

  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage={activePage} seo={seo}>
      {body}
      {after}
    </StorefrontPageShell>
  );
}
