import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import { mapPublicProduct } from "@/lib/public-product";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontProductGrid from "@/components/storefront/StorefrontProductGrid";
import StorefrontCategoryChips from "@/components/storefront/StorefrontCategoryChips";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import { resolveStudioPublicContext, shopPageTitle } from "@/lib/studio/public-context";
import { prisma } from "@/lib/prisma";
import { COMMERCE_CATEGORY_KEY } from "@/lib/studio/commerce-pages";
import { withCommerceContext } from "@/lib/studio/commerce-context";
import { studioPageNodes } from "@/lib/studio/storage";
import StudioPublicSections from "@/lib/studio/public-render";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import { shopCategoryPath } from "@/lib/storefront/paths";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug, categorySlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const catSlug = decodeURIComponent(categorySlug).trim().toLowerCase();
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const published = ctx.storefront.isPublished && !draft;
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      published,
    );
    const cat =
      ctx.categories.find((c) => c.slug === catSlug) ??
      (await prisma.category.findFirst({
        where: { ownerId: ctx.owner.id, slug: catSlug, isActive: true },
        select: { id: true, title: true, slug: true, description: true },
      }));
    if (!cat) return { title: "Shop", robots: { index: false, follow: false } };
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
      configRaw,
      entityType: "category",
      entityId: cat.id,
      defaults: {
        title: cat.title,
        description: cat.description ?? `${cat.title} at ${ctx.branding.headline}`,
      },
      path: `/shop/${encodeURIComponent(cat.slug)}`,
    });
  } catch {
    return { title: "Shop", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
  searchParams: Promise<{ draft?: string; category?: string }>;
}) {
  const { slug, categorySlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const catSlug = decodeURIComponent(categorySlug).trim().toLowerCase();
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

  let activeCategory = ctx.categories.find((c) => c.slug === catSlug);
  if (!activeCategory) {
    activeCategory =
      (await prisma.category.findFirst({
        where: { ownerId: ctx.owner.id, slug: catSlug, isActive: true },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          imageUrl: true,
          showOnWebsite: true,
        },
      })) ?? undefined;
  }
  if (!activeCategory) notFound();

  const links = await prisma.productCategory.findMany({
    where: {
      category: { ownerId: ctx.owner.id, slug: catSlug },
      product: { ownerId: ctx.owner.id },
    },
    select: { productId: true },
  });
  const ids = new Set(links.map((l) => l.productId));
  const filtered = catalogProducts.filter((p) => ids.has(p.id));

  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const nodes =
    studioCtx.active ? studioPageNodes(studioCtx.studio, COMMERCE_CATEGORY_KEY) : undefined;
  const metadata =
    studioCtx.active && nodes
      ? withCommerceContext(studioCtx.metadata, {
          kind: "category",
          ownerId: ctx.owner.id,
          catalogProducts,
          category: {
            id: activeCategory.id,
            slug: activeCategory.slug,
            title: activeCategory.title,
            description: activeCategory.description,
            imageUrl: activeCategory.imageUrl,
          },
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
            {activeCategory.title || title}
          </h1>
          <Suspense fallback={null}>
            <div className="mt-6">
              <StorefrontCategoryChips
                storefrontSlug={ctx.storefront.slug}
                categories={navCategories}
                activeSlug={activeCategory.slug}
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
              products={filtered}
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
