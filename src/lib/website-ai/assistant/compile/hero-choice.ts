import type { HeroPreset } from "@/lib/studio/preset-registry";
import { missingHeroNeed, type HeroFacts } from "@/lib/studio/hero-needs";
import type { AssistantContext } from "../context/types";
import type { BriefData } from "../brief/schema";

const PHOTO_STYLES = new Set<HeroPreset>(["background", "farm-landscape", "split", "editorial"]);
const QUIET_STYLES = new Set<HeroPreset>(["minimal", "shop-first", "promo"]);

/** Same input, same pick; different businesses spread across the options. */
function stablePick<T>(options: T[], seed: string): T {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return options[(h >>> 0) % options.length];
}

export function heroFacts(ctx: AssistantContext, sellerPhoto: boolean): HeroFacts {
  return {
    hasPhoto: sellerPhoto,
    productCount: ctx.catalogue.productCount,
    categoryCount: ctx.catalogue.categories.length,
    hasMenu: ctx.features.menus.length > 0,
    hasCountdownMenu: ctx.features.upcomingDrop,
    hasHours: ctx.searchProfile.hours.length > 0,
  };
}

function categoriesWithPhotos(ctx: AssistantContext): number {
  const slugs = new Set(ctx.catalogue.products.filter((p) => p.imageUrl && p.categorySlug).map((p) => p.categorySlug));
  return ctx.catalogue.categories.filter((c) => slugs.has(c.slug)).length;
}

/**
 * The home page hero from real data: the seller's goal first, then what the shop has most of
 * (photos, categories, products). Photo-on-top styles are only used with the seller's own photo.
 */
export function chooseHomeHero(ctx: AssistantContext, brief: BriefData, blueprintHero: HeroPreset, sellerPhoto: boolean): HeroPreset {
  const facts = heroFacts(ctx, sellerPhoto);
  const ready = (s: HeroPreset) => !missingHeroNeed(s, facts);
  const goal = brief.business.primaryGoal;
  const photos = ctx.catalogue.productPhotoCount;

  const goalFit: HeroPreset[] = [];
  if (goal === "pre_orders" && ready("countdown")) goalFit.push("countdown");
  if (goal === "local_visits" && ready("visit-us")) goalFit.push("visit-us");
  if (goal === "sell_online" && photos > 0) goalFit.push(photos >= 4 ? "product-collage" : "featured-product");
  if (goalFit.length) return stablePick(goalFit, ctx.storefrontId);

  const rich: HeroPreset[] = [];
  if (categoriesWithPhotos(ctx) >= 3) rich.push("category-mosaic");
  if (sellerPhoto) rich.push(PHOTO_STYLES.has(blueprintHero) ? blueprintHero : "background", "split");
  if (photos >= 4) rich.push("product-collage");
  if (rich.length) return stablePick(rich, ctx.storefrontId);

  if (ready("stand-status")) return "stand-status";
  return QUIET_STYLES.has(blueprintHero) ? blueprintHero : stablePick(["minimal", "shop-first"], ctx.storefrontId);
}

/** Inner pages (About, Contact…) get a calm hero; a photo only when the seller gave one. */
export function chooseContentHero(blueprintHero: HeroPreset, sellerPhoto: boolean): HeroPreset {
  if (sellerPhoto) return PHOTO_STYLES.has(blueprintHero) ? blueprintHero : "split";
  return "minimal";
}
