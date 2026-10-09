import type { StudioSectionType } from "@/lib/studio/types";
import { about, hero, image, imageText, text } from "./content-sections";
import { categories, menuDetail, nextDrop, productDetail, productGrid } from "./commerce-sections";
import { farmStand, pickup, reviews, signup } from "./trust-sections";
import type { SectionDefinition, VendlSectionType } from "./types";
import { sectionStyleSchema } from "./section-style";

/**
 * The one list of supported website sections. Keyed by stable Vendl type;
 * `satisfies` makes adding a type without a definition a compile error.
 */
const DEFINITIONS = {
  hero,
  productGrid,
  categories,
  nextDrop,
  text,
  image,
  imageText,
  about,
  reviews,
  pickup,
  signup,
  farmStand,
  productDetail,
  menuDetail,
} satisfies Record<VendlSectionType, SectionDefinition>;

/** Every section shares the same optional colour/typography `style` setting. */
function withStyle(def: SectionDefinition): SectionDefinition {
  return { ...def, settings: def.settings.extend({ style: sectionStyleSchema.optional() }) };
}

export const SECTION_REGISTRY = Object.fromEntries(
  (Object.keys(DEFINITIONS) as VendlSectionType[]).map((type) => [type, withStyle(DEFINITIONS[type])]),
) as Record<VendlSectionType, SectionDefinition>;

/** Every Craft resolver name maps to exactly one Vendl type (compile-checked). */
export const VENDL_TYPE_BY_CRAFT_NAME = {
  CraftHeroSection: "hero",
  CraftProductGridSection: "productGrid",
  CraftCategoriesSection: "categories",
  CraftNextDropSection: "nextDrop",
  CraftTextSection: "text",
  CraftImageSection: "image",
  CraftImageTextSection: "imageText",
  CraftAboutSection: "about",
  CraftReviewsSection: "reviews",
  CraftPickupSection: "pickup",
  CraftSignupSection: "signup",
  CraftFarmStandSection: "farmStand",
  CraftProductDetailSection: "productDetail",
  CraftMenuDetailSection: "menuDetail",
} as const satisfies Record<StudioSectionType, VendlSectionType>;

export const VENDL_SECTION_TYPES = Object.keys(SECTION_REGISTRY) as VendlSectionType[];

export function isVendlSectionType(value: string): value is VendlSectionType {
  return Object.prototype.hasOwnProperty.call(SECTION_REGISTRY, value);
}

export function sectionDefinition(type: VendlSectionType): SectionDefinition {
  return SECTION_REGISTRY[type];
}

export function vendlTypeForCraftName(name: string): VendlSectionType | undefined {
  return Object.prototype.hasOwnProperty.call(VENDL_TYPE_BY_CRAFT_NAME, name)
    ? VENDL_TYPE_BY_CRAFT_NAME[name as StudioSectionType]
    : undefined;
}
