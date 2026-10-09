import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { mapPublicProduct } from "@/lib/public-product";
import { loadUpcomingMenusForStorefront } from "@/lib/puck/load-upcoming-menus";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import { prisma } from "@/lib/prisma";

export async function buildPuckSpikeMetadata(
  ctx: NonNullable<StorefrontContext>,
  draft?: boolean,
): Promise<PuckSpikeMetadata> {
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);
  const productIds = ctx.products.map((p) => p.id);
  const categoryLinks =
    productIds.length > 0
      ? await prisma.productCategory.findMany({
          where: { productId: { in: productIds } },
          select: { productId: true, categoryId: true },
        })
      : [];
  const categoriesByProduct = new Map<string, string[]>();
  for (const link of categoryLinks) {
    const list = categoriesByProduct.get(link.productId) ?? [];
    list.push(link.categoryId);
    categoriesByProduct.set(link.productId, list);
  }

  const products = ctx.products.map((p) => {
    const card = mapPublicProduct(p, {
      showExactStock: ctx.stand.showExactStock,
      showPublicScarcity: ctx.stand.showPublicScarcity,
      timeZone: ctx.stand.timezone,
    });
    return {
      id: card.id,
      slug: card.slug,
      name: card.name,
      priceCents: card.priceCents,
      imageUrl: card.imageUrl,
      soldOut: card.soldOut,
      label: card.label,
      categoryIds: categoriesByProduct.get(card.id) ?? [],
    };
  });

  const menus = await loadUpcomingMenusForStorefront({
    ownerId: ctx.owner.id,
    standId: ctx.stand.id,
    timeZone: ctx.stand.timezone,
  });

  return {
    branding: {
      headline: ctx.branding.headline,
      subheadline: ctx.branding.subheadline,
      about: ctx.branding.about,
      heroImageUrl: ctx.branding.heroImageUrl,
      regionLabel: ctx.branding.regionLabel,
      businessName: ctx.branding.businessName,
    },
    products,
    menus,
    storefrontSlug: ctx.storefront.slug,
    standSlug: ctx.stand.slug,
    currency: ctx.stand.currency,
    draft,
    basePath,
    categories: ctx.categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      imageUrl: c.imageUrl,
    })),
    businessMode: ctx.businessMode,
    resolvedBranding: ctx.branding,
    enabledPages: storefrontEnabledPages(ctx.config),
  };
}
