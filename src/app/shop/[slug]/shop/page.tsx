import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import { mapPublicProduct } from "@/lib/public-product";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontProductGrid from "@/components/storefront/StorefrontProductGrid";
import StorefrontCategoryChips from "@/components/storefront/StorefrontCategoryChips";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import { resolveStudioPublicContext, shopPageTitle } from "@/lib/studio/public-context";
import { COMMERCE_SHOP_KEY } from "@/lib/studio/commerce-pages";
import { withCommerceContext } from "@/lib/studio/commerce-context";
import { studioPageNodes } from "@/lib/studio/storage";
import StudioPublicSections from "@/lib/studio/public-render";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import { shopCategoryPath } from "@/lib/storefront/paths";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    return storefrontMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
      pageTitle: "Shop",
    });
  } catch {
    return { title: "Shop", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string; category?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const basePath = await currentStorefrontBasePath(slug);

  if (sp.category?.trim()) {
    permanentRedirect(shopCategoryPath(slug, sp.category.trim(), draft, basePath));
  }

  const ctx = await loadStorefrontPage(slug, draft);
  if (!ctx.config.pages.shop?.enabled) notFound();

  const catalogProducts = ctx.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: ctx.stand.showExactStock,
      showPublicScarcity: ctx.stand.showPublicScarcity,
      timeZone: ctx.stand.timezone,
    }),
  );

  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const nodes =
    studioCtx.active ? studioPageNodes(studioCtx.studio, COMMERCE_SHOP_KEY) : undefined;
  const metadata =
    studioCtx.active && nodes
      ? withCommerceContext(studioCtx.metadata, {
          kind: "shop",
          ownerId: ctx.owner.id,
          catalogProducts,
        })
      : undefined;
  const title = studioCtx.active ? shopPageTitle(studioCtx.templateId) : "Shop";
  const navCategories = ctx.categories.filter((c) => c.showOnWebsite !== false);

  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage="shop">
      {nodes && metadata ? (
        <StudioPublicSections nodes={nodes} metadata={metadata} />
      ) : (
        <div className="storefront-page-content storefront-page-content--wide">
          <h1
            className={
              studioCtx.active
                ? "studio-heading"
                : "font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]"
            }
          >
            {title}
          </h1>
          <Suspense fallback={null}>
            <div className="mt-6">
              <StorefrontCategoryChips
                storefrontSlug={ctx.storefront.slug}
                categories={navCategories}
                draft={draft}
                basePath={basePath}
              />
            </div>
          </Suspense>
          <div className="mt-8">
            <StorefrontProductGrid
              storefrontSlug={ctx.storefront.slug}
              standSlug={ctx.stand.slug}
              currency={ctx.stand.currency}
              products={catalogProducts}
              branding={ctx.branding}
              draft={draft}
            />
          </div>
        </div>
      )}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
