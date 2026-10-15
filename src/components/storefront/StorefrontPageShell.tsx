import type { ReactNode } from "react";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import StudioPublicShell from "@/components/studio/shell/StudioPublicShell";
import StorefrontShell from "./StorefrontShell";
import StorefrontOriginTracker from "./StorefrontOriginTracker";
import StorefrontBreadcrumbs from "./StorefrontBreadcrumbs";
import StorefrontJsonLd from "./StorefrontJsonLd";
import type { StorefrontBreadcrumbItem } from "@/lib/storefront/technical-seo/breadcrumbs";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { greenValleyDemoOverride } from "@/lib/demo/green-valley/runtime-override";
import type { PageSeo } from "@/lib/seo/graph/page-graph";

export default async function StorefrontPageShell({
  ctx,
  draft,
  activePage,
  breadcrumbs,
  seo,
  children,
}: {
  ctx: NonNullable<StorefrontContext>;
  draft?: boolean;
  activePage: StorefrontPageId | "product" | "menu" | string;
  breadcrumbs?: StorefrontBreadcrumbItem[];
  /** Structured data for this page; without it only the business and website are described. */
  seo?: PageSeo;
  children: ReactNode;
}) {
  const schemaGraph = <StorefrontJsonLd ctx={ctx} draft={draft} seo={seo} />;
  const override = draft
    ? undefined
    : await greenValleyDemoOverride(ctx, { homeNodes: false });
  const studioCtx = await resolveStudioPublicContext(ctx, draft, override);
  const enabledPages = storefrontEnabledPages(ctx.config);
  const legacyActivePage: StorefrontPageId | "product" =
    activePage === "menu" ||
    (typeof activePage === "string" &&
      !["home", "shop", "about", "contact", "product"].includes(activePage))
      ? "shop"
      : (activePage as StorefrontPageId | "product");

  if (studioCtx.active) {
    return (
      <>
        {schemaGraph}
        {!draft ? (
          <StorefrontOriginTracker storefrontSlug={ctx.storefront.slug} />
        ) : null}
        {ctx.isDraftPreview ? (
          <div className="bg-[var(--field)] px-4 py-2 text-center text-xs font-semibold text-white">
            Draft preview — not visible to customers
          </div>
        ) : null}
        <StudioPublicShell
          metadata={studioCtx.metadata}
          draft={draft}
          activePage={activePage}
        >
          {breadcrumbs?.length ? (
            <StorefrontBreadcrumbs items={breadcrumbs} studioActive />
          ) : null}
          <div className="pb-28">{children}</div>
        </StudioPublicShell>
      </>
    );
  }

  return (
    <StorefrontShell
      storefrontSlug={ctx.storefront.slug}
      standSlug={ctx.stand.slug}
      branding={ctx.branding}
      activePage={legacyActivePage}
      enabledPages={enabledPages}
      draft={draft}
      isDraftPreview={ctx.isDraftPreview}
      fulfilmentOptions={ctx.fulfilmentOptions}
      currency={ctx.stand.currency}
    >
      {schemaGraph}
      {breadcrumbs?.length ? (
        <StorefrontBreadcrumbs items={breadcrumbs} />
      ) : null}
      {children}
    </StorefrontShell>
  );
}
