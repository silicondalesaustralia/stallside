import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage, storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import { mapPublicProduct } from "@/lib/public-product";
import StorefrontShell from "@/components/storefront/StorefrontShell";
import StorefrontProductGrid from "@/components/storefront/StorefrontProductGrid";
import StorefrontCategoryChips from "@/components/storefront/StorefrontCategoryChips";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import { prisma } from "@/lib/prisma";
import { ProductChannelType } from "@/generated/prisma/client";

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
  const ctx = await loadStorefrontPage(slug, draft);
  if (!ctx.config.pages.shop?.enabled) notFound();

  const catalogProducts = ctx.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: ctx.stand.showExactStock,
      showPublicScarcity: ctx.stand.showPublicScarcity,
      timeZone: ctx.stand.timezone,
    }),
  );

  let filtered = catalogProducts;
  if (sp.category) {
    const catSlug = sp.category.trim().toLowerCase();
    const links = await prisma.productCategory.findMany({
      where: {
        category: { ownerId: ctx.owner.id, slug: catSlug },
        product: { ownerId: ctx.owner.id },
      },
      select: { productId: true },
    });
    const ids = new Set(links.map((l) => l.productId));
    filtered = catalogProducts.filter((p) => ids.has(p.id));
  }

  const enabledPages = storefrontEnabledPages(ctx.config);

  return (
    <StorefrontShell
      storefrontSlug={ctx.storefront.slug}
      standSlug={ctx.stand.slug}
      branding={ctx.branding}
      activePage="shop"
      enabledPages={enabledPages}
      draft={draft}
      isDraftPreview={ctx.isDraftPreview}
      fulfilmentOptions={ctx.fulfilmentOptions}
      currency={ctx.stand.currency}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Shop
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
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontShell>
  );
}
