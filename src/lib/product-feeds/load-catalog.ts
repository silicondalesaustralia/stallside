import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { productOnStandWhere } from "@/lib/catalogue/product-on-stand";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { businessPageProductWhere } from "@/lib/product-visibility";
import { publicVariantsInclude } from "@/lib/product-variants/public-variant";
import { prisma } from "@/lib/prisma";
import { parseBusinessProfile } from "@/lib/seo/business-profile";
import { withMainCategorySlugs } from "@/lib/studio/product-main-category";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { buildFeedCatalog, type FeedProductRow } from "./build-items";
import type { FeedCatalog } from "./types";

/** Live published catalogue as a feed, or null when the shop is not public. */
export async function loadProductFeedCatalog(slug: string): Promise<FeedCatalog | null> {
  const ctx = await loadStorefrontContext(slug);
  if (!ctx) return null;

  const host = await loadPrimaryCustomHostname(ctx.storefront.id);
  const products = await prisma.product.findMany({
    where: {
      AND: [
        { ownerId: ctx.owner.id },
        businessPageProductWhere,
        productOnStandWhere(ctx.stand.id),
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      variants: publicVariantsInclude,
      primaryCategory: { select: { title: true, slug: true } },
    },
  });

  const withCats = await withMainCategorySlugs(products, ctx.categories);
  const titleBySlug = new Map(ctx.categories.map((c) => [c.slug, c.title]));
  const rows: FeedProductRow[] = withCats.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    galleryImageUrls: p.galleryImageUrls,
    priceCents: p.priceCents,
    compareAtPriceCents: p.compareAtPriceCents,
    stockQuantity: p.stockQuantity,
    sku: p.sku,
    upc: p.upc,
    currency: p.currency,
    isPreOrder: p.isPreOrder,
    collectionAt: p.collectionAt,
    shippingCents: p.shippingCents,
    option1Name: p.option1Name,
    option2Name: p.option2Name,
    option3Name: p.option3Name,
    mainCategorySlug: p.mainCategorySlug,
    categoryTitle:
      (p.mainCategorySlug ? titleBySlug.get(p.mainCategorySlug) : null) ??
      p.primaryCategory?.title ??
      null,
    variants: p.variants.map((v) => ({
      id: v.id,
      option1: v.option1,
      option2: v.option2,
      option3: v.option3,
      sku: v.sku,
      upc: v.upc,
      priceCents: v.priceCents,
      compareAtCents: v.compareAtCents,
      stockQuantity: v.stockQuantity,
      imageUrl: v.imageUrl,
    })),
  }));

  const profile = parseBusinessProfile(ctx.storefront.businessProfile);
  const brandName = ctx.branding.businessName || ctx.branding.headline;
  const homeUrl = storefrontPublicUrl(ctx.storefront.slug, { primaryCustomHostname: host });
  return buildFeedCatalog({
    slug: ctx.storefront.slug,
    brandName,
    homeUrl,
    primaryCustomHostname: host,
    currency: ctx.stand.currency,
    country: profile.address?.country ?? null,
    acceptsReturns: profile.returnPolicy?.accepted ?? null,
    returnDays: profile.returnPolicy?.days ?? null,
    products: rows,
  });
}
