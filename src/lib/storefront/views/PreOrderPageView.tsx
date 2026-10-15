import { notFound } from "next/navigation";
import { categorySlugsById } from "@/lib/catalogue/main-category";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { mapPublicProduct } from "@/lib/public-product";
import { productLiveWhere } from "@/lib/product-visibility";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import PreOrderPageContent from "@/app/s/[standSlug]/pre/[pageSlug]/PreOrderPageContent";
import { menuPageSeo } from "@/lib/seo/menu-page-seo";

type ViewProps = { slug: string; pageSlug: string; draft: boolean };

async function loadPage({ slug, pageSlug, draft }: ViewProps) {
  const ctx = await loadStorefrontPage(slug, draft);
  const page = await prisma.preOrderPage.findFirst({
    where: { standId: ctx.stand.id, slug: decodeURIComponent(pageSlug).trim().toLowerCase(), isActive: true },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return { ctx, page };
}

export async function preOrderPageViewMetadata(props: ViewProps): Promise<Metadata> {
  try {
    const { ctx, page } = await loadPage(props);
    if (!page) return { title: "Pre-order", robots: { index: false, follow: false } };
    const published = ctx.storefront.isPublished && !props.draft;
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
      configRaw: seoConfigSource(ctx.storefront.draftConfig, ctx.storefront.publishedConfig, published),
      entityType: "menu",
      entityId: page.id,
      defaults: { title: page.title, description: page.description ?? page.title, ogImageUrl: page.imageUrl },
      path: `/pre-orders/${encodeURIComponent(page.slug)}`,
    });
  } catch {
    return { title: "Pre-order", robots: { index: false, follow: false } };
  }
}

/** A stand pre-order page shown on the website at `/pre-orders/{page}`. */
export default async function PreOrderPageView(props: ViewProps) {
  const { ctx, page } = await loadPage(props);
  if (!page) notFound();
  const products = await prisma.product.findMany({
    where: { standId: ctx.stand.id, ...productLiveWhere },
    include: {
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { choices: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  const categorySlugs = categorySlugsById(ctx.products);
  const byId = new Map(
    products.map((p) => [
      p.id,
      mapPublicProduct({ ...p, mainCategorySlug: categorySlugs.get(p.id) ?? null }, {
        showExactStock: ctx.stand.showExactStock || page.showExactStock,
        showPublicScarcity: ctx.stand.showPublicScarcity,
        timeZone: ctx.stand.timezone,
      }),
    ]),
  );
  const pageProducts = page.items
    .map((i) => byId.get(i.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (pageProducts.length === 0) notFound();

  return (
    <StorefrontPageShell
      ctx={ctx}
      draft={props.draft}
      activePage="menu"
      seo={menuPageSeo(ctx, {
        path: `/pre-orders/${encodeURIComponent(page.slug)}`,
        name: page.title,
        description: page.description,
        imageUrl: page.imageUrl,
        products: pageProducts,
        isPreOrder: true,
      })}
    >
      <div className="storefront-page-content storefront-page-content--narrow">
        <PreOrderPageContent
          standSlug={ctx.stand.slug}
          standName={ctx.stand.name}
          timezone={ctx.stand.timezone}
          currency={ctx.stand.currency}
          accentColor={ctx.branding.accentColor ?? null}
          page={{
            slug: page.slug,
            title: page.title,
            description: page.description,
            collectionAt: page.collectionAt,
            orderByAt: page.orderByAt,
            collectionNote: page.collectionNote,
            handoverMode: page.handoverMode,
          }}
          pageProducts={pageProducts}
          catalogProducts={[...byId.values()]}
        />
      </div>
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
