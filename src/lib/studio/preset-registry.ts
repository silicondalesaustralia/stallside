import type { StudioTemplateId } from "./types";

export type HeroPreset =
  | "editorial"
  | "split"
  | "background"
  | "minimal"
  | "farm-landscape"
  | "stand-status"
  | "produce-split"
  | "simple"
  | "shop-first"
  | "current-menu"
  | "product-collage"
  | "promo";

export type ProductPreset =
  | "editorial"
  | "classic"
  | "featured"
  | "compact"
  | "farm-grid"
  | "availability"
  | "shop-grid"
  | "dense"
  | "list";

export type CategoryPreset =
  | "tiles"
  | "cards"
  | "compact"
  | "minimal"
  | "produce-tiles"
  | "shop-cards"
  | "horizontal";

export type NextDropPreset =
  | "featured"
  | "card"
  | "preview"
  | "timeline"
  | "next-collection"
  | "weekly-box"
  | "current-menu"
  | "product-strip";

export type ReviewsPreset = "cards" | "quote" | "featured" | "rating-row";
export type PickupPreset = "cards" | "simple" | "split" | "visit-stand" | "info-band";
export type ImageTextPreset = "image-left" | "image-right" | "editorial" | "wide" | "farm-story";

export type PresetOption<T extends string> = { value: T; label: string };

export const HERO_PRESETS: Record<StudioTemplateId, PresetOption<HeroPreset>[]> = {
  artisan: [
    { value: "editorial", label: "Editorial" },
    { value: "split", label: "Split" },
    { value: "background", label: "Background" },
    { value: "minimal", label: "Minimal" },
  ],
  farmhouse: [
    { value: "farm-landscape", label: "Farm landscape" },
    { value: "stand-status", label: "Stand status" },
    { value: "produce-split", label: "Produce split" },
    { value: "simple", label: "Simple" },
  ],
  market: [
    { value: "shop-first", label: "Shop first" },
    { value: "current-menu", label: "Current menu" },
    { value: "product-collage", label: "Product collage" },
    { value: "promo", label: "Promo" },
  ],
};

export const PRODUCT_PRESETS: Record<StudioTemplateId, PresetOption<ProductPreset>[]> = {
  artisan: [
    { value: "editorial", label: "Editorial cards" },
    { value: "classic", label: "Classic grid" },
    { value: "featured", label: "Featured row" },
    { value: "compact", label: "Compact" },
  ],
  farmhouse: [
    { value: "farm-grid", label: "Farm grid" },
    { value: "availability", label: "Availability cards" },
    { value: "featured", label: "Featured produce" },
    { value: "compact", label: "Compact" },
  ],
  market: [
    { value: "shop-grid", label: "Shop grid" },
    { value: "dense", label: "Dense grid" },
    { value: "featured", label: "Featured products" },
    { value: "list", label: "List" },
  ],
};

export const CATEGORY_PRESETS: Record<StudioTemplateId, PresetOption<CategoryPreset>[]> = {
  artisan: [
    { value: "tiles", label: "Editorial tiles" },
    { value: "cards", label: "Image cards" },
    { value: "minimal", label: "Minimal links" },
  ],
  farmhouse: [
    { value: "produce-tiles", label: "Produce tiles" },
    { value: "cards", label: "Farm cards" },
    { value: "compact", label: "Simple" },
  ],
  market: [
    { value: "shop-cards", label: "Shop cards" },
    { value: "horizontal", label: "Horizontal scroll" },
    { value: "compact", label: "Compact tiles" },
  ],
};

export const NEXT_DROP_PRESETS: Record<StudioTemplateId, PresetOption<NextDropPreset>[]> = {
  artisan: [
    { value: "featured", label: "Featured drop" },
    { value: "preview", label: "Product preview" },
    { value: "timeline", label: "Timeline" },
    { value: "card", label: "Compact card" },
  ],
  farmhouse: [
    { value: "next-collection", label: "Next collection" },
    { value: "weekly-box", label: "Weekly box" },
    { value: "timeline", label: "Timeline" },
    { value: "card", label: "Compact" },
  ],
  market: [
    { value: "current-menu", label: "Current menu" },
    { value: "featured", label: "Next drop" },
    { value: "product-strip", label: "Product strip" },
    { value: "card", label: "Compact" },
  ],
};

export function defaultHeroPreset(templateId: StudioTemplateId): HeroPreset {
  if (templateId === "farmhouse") return "farm-landscape";
  if (templateId === "market") return "shop-first";
  return "background";
}

export function defaultProductPreset(templateId: StudioTemplateId): ProductPreset {
  if (templateId === "farmhouse") return "farm-grid";
  if (templateId === "market") return "shop-grid";
  return "editorial";
}

export function mapProductPreset(
  templateId: StudioTemplateId,
  preset: ProductPreset,
): "editorial" | "classic" | "featured" | "compact" {
  if (preset === "farm-grid" || preset === "shop-grid" || preset === "availability") return "classic";
  if (preset === "dense" || preset === "list") return "compact";
  if (preset === "editorial" || preset === "classic" || preset === "featured" || preset === "compact") {
    return preset;
  }
  return defaultProductPreset(templateId) === "editorial" ? "editorial" : "classic";
}

export function mapCategoryPreset(
  templateId: StudioTemplateId,
  preset: CategoryPreset,
): "tiles" | "cards" | "compact" | "minimal" {
  if (preset === "produce-tiles" || preset === "shop-cards" || preset === "horizontal") return "tiles";
  if (preset === "cards") return "cards";
  if (preset === "compact") return "compact";
  return "minimal";
}

export function isValidHeroPreset(templateId: StudioTemplateId, preset: string): preset is HeroPreset {
  return HERO_PRESETS[templateId].some((p) => p.value === preset);
}
