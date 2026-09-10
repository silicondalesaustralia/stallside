import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { loadStorefrontReviews } from "@/lib/studio/load-reviews";
import type { WebsiteBusinessContext } from "./types";

/** Compact tenant-safe context for website AI — no secrets or PII dumps. */
export async function buildWebsiteBusinessContext(
  ctx: NonNullable<StorefrontContext>,
): Promise<WebsiteBusinessContext> {
  const reviews = await loadStorefrontReviews(ctx.owner.id, 3);
  const studio = extractWebsiteStudio(ctx.storefront.draftConfig);
  const hasFarmStand =
    ctx.businessMode === "FARM_STAND" || ctx.businessMode === "BOTH";
  const hasMenus =
    ctx.businessMode === "FOOD_BUSINESS" || ctx.businessMode === "BOTH";
  const hasDelivery = ctx.fulfilmentOptions.some(
    (o) =>
      o.kind.toLowerCase().includes("deliver") || Boolean(o.deliveryZone),
  );
  const hasPickup = ctx.fulfilmentOptions.some(
    (o) =>
      o.kind.toLowerCase().includes("pickup") ||
      Boolean(o.pickupLocation) ||
      Boolean(o.pickupWindow),
  );

  return {
    ownerId: ctx.owner.id,
    businessMode: ctx.businessMode,
    businessName: ctx.branding.businessName,
    headline: ctx.branding.headline,
    subheadline: ctx.branding.subheadline,
    about: ctx.branding.about,
    regionLabel: ctx.branding.regionLabel,
    hasFarmStand,
    hasMenus,
    hasDelivery,
    hasPickup: hasPickup || ctx.fulfilmentOptions.length > 0,
    productCount: ctx.products.length,
    categoryCount: ctx.categories.filter((c) => c.showOnWebsite !== false).length,
    reviewCount: reviews.length,
    categories: ctx.categories
      .filter((c) => c.showOnWebsite !== false)
      .slice(0, 12)
      .map((c) => ({ id: c.id, title: c.title, slug: c.slug })),
    featuredProducts: ctx.products.slice(0, 8).map((p) => ({
      id: p.id,
      title: p.name,
    })),
    productPhotoCount: ctx.products.filter((p) => Boolean(p.imageUrl)).length,
    logoUrl: ctx.branding.logoUrl,
    heroImageUrl: ctx.branding.heroImageUrl,
    existingTemplateId: studio?.templateId ?? null,
    hasExistingStudio: Boolean(studio?.nodes),
  };
}
