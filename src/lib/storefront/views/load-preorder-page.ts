import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { categorySlugsById } from "@/lib/catalogue/main-category";
import { prisma } from "@/lib/prisma";
import { mapPublicProduct } from "@/lib/public-product";
import { productLiveWhere } from "@/lib/product-visibility";
import { loadPreOrderCardRail } from "@/lib/preorder-card-rail";
import type { PreOrderPageData } from "./preorder-page-types";

/** One active pre-order page by slug (or the stand's first one), with its products; null when there's nothing to show. */
export async function loadPreOrderPageData(
  ctx: NonNullable<StorefrontContext>,
  pageSlug?: string,
): Promise<PreOrderPageData | null> {
  const page = await prisma.preOrderPage.findFirst({
    where: {
      standId: ctx.stand.id,
      isActive: true,
      ...(pageSlug ? { slug: decodeURIComponent(pageSlug).trim().toLowerCase() } : {}),
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { orderByAt: "desc" },
  });
  if (!page) return null;
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
  if (pageProducts.length === 0) return null;

  return {
    id: page.id,
    standSlug: ctx.stand.slug,
    standName: ctx.stand.name,
    timezone: ctx.stand.timezone,
    currency: ctx.stand.currency,
    accentColor: ctx.branding.accentColor ?? null,
    cardReady: (await loadPreOrderCardRail(ctx.owner)).cardReady,
    page: {
      slug: page.slug,
      title: page.title,
      description: page.description,
      imageUrl: page.imageUrl,
      collectionAt: page.collectionAt.toISOString(),
      orderByAt: page.orderByAt.toISOString(),
      collectionNote: page.collectionNote,
      handoverMode: page.handoverMode,
    },
    pageProducts,
    catalogProducts: [...byId.values()],
  };
}
