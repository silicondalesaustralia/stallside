import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
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
import {
  COMMERCE_CATEGORY_KEY,
  COMMERCE_SHOP_KEY,
} from "@/lib/studio/commerce-pages";
import { withCommerceContext } from "@/lib/studio/commerce-context";
import { studioPageNodes } from "@/lib/studio/storage";
import StudioPublicSections from "@/lib/studio/public-render";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string; category?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const published = ctx.storefront.isPublished && !draft;
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      published,
    );
    const catSlug = sp.category?.trim().toLowerCase();
    if (catSlug) {
      const cat =
        ctx.categories.find((c) => c.slug === catSlug) ??
        (await prisma.category.findFirst({
          where: { ownerId: ctx.owner.id, slug: catSlug, isActive: true },
          select: { id: true, title: true, slug: true, description: true },
        }));
      if (cat) {
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
          path: `/shop?category=${encodeURIComponent(cat.slug)}`,
        });
      }
    }
    return storefrontMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
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
  const ctx = await loadStorefrontPage(slug, draft);
  if (!ctx.config.pages.shop?.enabled) notFound();

  const catalogProducts = ctx.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: ctx.stand.showExactStock,
      showPublicScarcity: ctx.stand.showPublicScarcity,
      timeZone: ctx.stand.timezone,
    }),
  );

  const catSlug = sp.category?.trim().toLowerCase();
  let filtered = catalogProducts;
  let activeCategory = catSlug
    ? ctx.categories.find((c) => c.slug === catSlug)
    : undefined;

  if (catSlug) {
    const links = await prisma.productCategory.findMany({
      where: {
        category: { ownerId: ctx.owner.id, slug: catSlug },
        product: { ownerId: ctx.owner.id },
      },
      select: { productId: true },
    });
    const ids = new Set(links.map((l) => l.productId));
    filtered = catalogProducts.filter((p) => ids.has(p.id));
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
          },
        })) ?? undefined;
    }
  }

  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const commerceKey = activeCategory ? COMMERCE_CATEGORY_KEY : COMMERCE_SHOP_KEY;
  const nodes =
    studioCtx.active ? studioPageNodes(studioCtx.studio, commerceKey) : undefined;
  const metadata =
    studioCtx.active && nodes
      ? withCommerceContext(studioCtx.metadata, {
          kind: activeCategory ? "category" : "shop",
          ownerId: ctx.owner.id,
          catalogProducts,
          category: activeCategory
            ? {
                id: activeCategory.id,
                slug: activeCategory.slug,
                title: activeCategory.title,
                description: activeCategory.description,
                imageUrl: activeCategory.imageUrl,
              }
            : undefined,
        })
      : undefined;
  const title = studioCtx.active ? shopPageTitle(studioCtx.templateId) : "Shop";

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
            {activeCategory?.title ?? title}
          </h1>
          <Suspense fallback={null}>
            <div className="mt-6">
              <StorefrontCategoryChips
                storefrontSlug={ctx.storefront.slug}
                categories={ctx.categories}
                draft={draft}
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
