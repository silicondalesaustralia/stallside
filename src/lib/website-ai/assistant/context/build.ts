import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { loadStorefrontReviews } from "@/lib/studio/load-reviews";
import { GREEN_VALLEY_DEMO_EMAIL } from "@/lib/demo/green-valley/constants";
import { loadFeatureEntities, loadPaymentBrandIds } from "./features";
import type { AssistantContext } from "./types";

type Ctx = NonNullable<StorefrontContext>;

function isDeliveryKind(kind: string): boolean {
  const k = kind.toLowerCase();
  return k.includes("deliver") || k.includes("ship");
}

/** One context builder shared by page recommendations, prompts and the compiler. */
export async function buildAssistantContext(ctx: Ctx): Promise<AssistantContext> {
  const [reviews, features, paymentBrands] = await Promise.all([
    loadStorefrontReviews(ctx.owner.id, 6),
    loadFeatureEntities(ctx.owner.id, ctx.stand.id),
    loadPaymentBrandIds(ctx),
  ]);
  const studio = extractWebsiteStudio(ctx.storefront.draftConfig);
  const visibleCategories = ctx.categories.filter((c) => c.showOnWebsite !== false);
  const options = ctx.fulfilmentOptions;
  const delivery = options.filter((o) => isDeliveryKind(o.kind) || Boolean(o.deliveryZone));
  const pickup = options.filter((o) => !delivery.includes(o));
  const isDemoOwner = ctx.owner.contactEmail === GREEN_VALLEY_DEMO_EMAIL;
  const realReviews = isDemoOwner ? [] : reviews.filter((r) => r.body.trim().length > 0);

  return {
    ownerId: ctx.owner.id,
    storefrontId: ctx.storefront.id,
    storefrontSlug: ctx.storefront.slug,
    businessMode: ctx.businessMode,
    businessName: ctx.branding.businessName,
    existing: {
      headline: ctx.branding.headline,
      subheadline: ctx.branding.subheadline,
      about: ctx.branding.about,
      regionLabel: ctx.branding.regionLabel,
      logoUrl: ctx.branding.logoUrl,
      heroImageUrl: ctx.branding.heroImageUrl,
      accentColor: ctx.branding.accentColor,
      secondaryColor: ctx.branding.secondaryColor,
      fontPairId: ctx.config.themeOverrides?.fontPairId ?? null,
      templateId: studio?.templateId ?? null,
      hasLayout: Boolean(studio?.nodes),
      isPublished: ctx.storefront.isPublished,
    },
    catalogue: {
      productCount: ctx.products.length,
      products: ctx.products.slice(0, 24).map((p) => ({
        id: p.id,
        title: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl ?? null,
        categorySlug: p.mainCategorySlug ?? null,
      })),
      categories: visibleCategories.slice(0, 16).map((c) => ({ id: c.id, title: c.title, slug: c.slug })),
      productPhotoCount: ctx.products.filter((p) => Boolean(p.imageUrl)).length,
    },
    features: {
      ...features,
      pickup: pickup.length > 0,
      delivery: delivery.length > 0,
      pickupLabels: pickup.map((o) => o.label).filter(Boolean).slice(0, 6),
      deliveryLabels: delivery.map((o) => o.label).filter(Boolean).slice(0, 6),
      paymentBrands,
      cardPayments: paymentBrands.some((b) => b !== "cash" && b !== "payid"),
    },
    reviews: {
      count: realReviews.length,
      samples: realReviews.slice(0, 3).map((r) => ({ rating: r.rating, body: r.body.slice(0, 300) })),
    },
    stand: { name: ctx.stand.name, locality: ctx.branding.regionLabel },
  };
}
