import type { AssistantContext } from "../context/types";
import type { ModelSectionType } from "../ai/schemas";

/** Sections whose data actually exists for this business (no empty or fake blocks). */
export function availableSections(ctx: AssistantContext): Set<ModelSectionType> {
  const set = new Set<ModelSectionType>(["hero", "about", "imageText", "text", "faq", "contactForm", "signup"]);
  const mode = ctx.businessMode;
  if (ctx.catalogue.productCount > 0) set.add("productGrid");
  if (ctx.catalogue.categories.length >= 2) set.add("categories");
  const hasDrops = ctx.features.menus.length > 0 || ctx.features.preOrders.length > 0;
  if ((mode === "FOOD_BUSINESS" || mode === "BOTH") && hasDrops) set.add("nextDrop");
  if (mode === "FARM_STAND" || mode === "BOTH") set.add("farmStand");
  if (ctx.reviews.count > 0) set.add("reviews");
  if (ctx.features.pickup || ctx.features.delivery) set.add("pickup");
  if (ctx.features.paymentBrands.length > 0) set.add("payments");
  return set;
}

/** One-per-page sections (mirrors the section registry's singletons). */
export const SINGLETON_SECTIONS = new Set<ModelSectionType>([
  "hero",
  "about",
  "categories",
  "nextDrop",
  "reviews",
  "pickup",
  "signup",
  "farmStand",
]);

/** Sections that only make sense first on a page. */
export const LEADING_SECTIONS = new Set<ModelSectionType>(["hero"]);
