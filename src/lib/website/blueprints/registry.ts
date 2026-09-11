import type { WebsiteBlueprint, WebsiteBlueprintId } from "./types";
import { WEBSITE_BLUEPRINT_IDS, isWebsiteBlueprintId } from "./types";
import { BLUEPRINT_LAYOUTS } from "./layouts";
import { BLUEPRINT_BRAND_KITS } from "./brand-kits";
import { BLUEPRINT_CARD_META } from "./card-meta";

type Core = Omit<
  WebsiteBlueprint,
  "layout" | "brandKit" | "assetNeeds" | "cardDescription" | "layoutTags" | "previewTone"
>;

function toneFromBrand(
  id: WebsiteBlueprintId,
  layout: WebsiteBlueprint["layout"],
): WebsiteBlueprint["previewTone"] {
  const p = BLUEPRINT_BRAND_KITS[id].palette;
  const cols = layout.gridColumns.desktop;
  const productCols = (typeof cols === "number" ? Math.min(4, Math.max(2, cols)) : 3) as
    | 2
    | 3
    | 4;
  const heroStyle =
    layout.hero === "FRAMED_INSET"
      ? "minimal"
      : layout.hero === "TYPE_BLOCK"
        ? "bold"
        : layout.hero === "COLLAGE_TRIO"
          ? "collage"
          : layout.hero === "EDITORIAL_STACK" ||
              layout.hero === "PROMO_BANNER" ||
              layout.hero === "FULL_BLEED"
            ? "full"
            : "split";
  return {
    bg: p.background,
    ink: p.text,
    muted: p.muted,
    accent: p.primary,
    wash: p.surface,
    heroStyle,
    productCols,
    cardRadius: `${BLUEPRINT_BRAND_KITS[id].shape.radiusPx}px`,
  };
}

function define(core: Core): WebsiteBlueprint {
  const layout = BLUEPRINT_LAYOUTS[core.id];
  const meta = BLUEPRINT_CARD_META[core.id];
  return {
    ...core,
    layout,
    brandKit: BLUEPRINT_BRAND_KITS[core.id],
    assetNeeds: meta.assetNeeds,
    cardDescription: meta.cardDescription,
    layoutTags: meta.layoutTags,
    previewTone: toneFromBrand(core.id, layout),
  };
}

const BLUEPRINTS: Record<WebsiteBlueprintId, WebsiteBlueprint> = {
  editorial: define({
    id: "editorial",
    name: "Editorial",
    description: "Image-led and spacious, with strong storytelling and a premium product focus.",
    designSystem: "artisan",
    traits: ["image-led", "spacious", "premium", "story-forward"],
    suitableFor: ["fashion", "artisan", "premium food", "homewares"],
    layoutRecipe: "story_led",
    preferredHomeSlots: ["story", "commerce", "trust", "pickup", "signup"],
    preferredPresets: { Hero: "editorial", ProductGrid: "editorial", ImageText: "editorial" },
    contentDensity: "low",
    imageEmphasis: "high",
    commerceEmphasis: "balanced",
  }),
  marketplace: define({
    id: "marketplace",
    name: "Marketplace",
    description: "Category-rich and discovery-focused — practical shopping with clear navigation.",
    designSystem: "market",
    traits: ["discovery", "practical", "category-led", "commercial"],
    suitableFor: ["multi-category", "retail", "farm shops", "pet"],
    layoutRecipe: "browse_catalog",
    preferredHomeSlots: ["categories", "commerce", "trust", "story", "signup"],
    preferredPresets: { Hero: "shop-first", ProductGrid: "classic", CategoryGrid: "tiles" },
    contentDensity: "high",
    imageEmphasis: "medium",
    commerceEmphasis: "commerce-led",
  }),
  heritage: define({
    id: "heritage",
    name: "Heritage",
    description: "Warm and established — story-led craft without feeling outdated.",
    designSystem: "farmhouse",
    traits: ["warm", "story-led", "crafted", "traditional"],
    suitableFor: ["farms", "makers", "handmade", "local brands"],
    layoutRecipe: "story_led",
    preferredHomeSlots: ["story", "commerce", "farm_stand", "trust", "signup"],
    preferredPresets: { Hero: "split", ProductGrid: "farm-grid", About: "card" },
    contentDensity: "medium",
    imageEmphasis: "medium",
    commerceEmphasis: "story-led",
  }),
  minimal: define({
    id: "minimal",
    name: "Minimal",
    description: "Clean whitespace with product photography front and centre.",
    designSystem: "artisan",
    traits: ["clean", "restrained", "whitespace", "photo-led"],
    suitableFor: ["jewellery", "skincare", "beauty", "design"],
    layoutRecipe: "shop_first",
    preferredHomeSlots: ["commerce", "story", "trust", "signup"],
    preferredPresets: { Hero: "minimal", ProductGrid: "editorial" },
    contentDensity: "low",
    imageEmphasis: "high",
    commerceEmphasis: "balanced",
  }),
  bold: define({
    id: "bold",
    name: "Bold",
    description: "High-impact type and punchy blocks for energetic modern brands.",
    designSystem: "market",
    traits: ["energetic", "high-impact", "punchy", "modern"],
    suitableFor: ["streetwear", "merch", "DTC", "colourful products"],
    layoutRecipe: "shop_first",
    preferredHomeSlots: ["commerce", "categories", "how_it_works", "trust", "signup"],
    preferredPresets: { Hero: "promo", ProductGrid: "featured", Text: "centre" },
    contentDensity: "medium",
    imageEmphasis: "high",
    commerceEmphasis: "commerce-led",
  }),
  local: define({
    id: "local",
    name: "Local",
    description: "Approachable and location-first — visit, pickup, and what’s available.",
    designSystem: "farmhouse",
    traits: ["community", "practical", "location-first", "friendly"],
    suitableFor: ["farm stands", "florists", "market sellers", "local producers"],
    layoutRecipe: "local_visit",
    preferredHomeSlots: ["farm_stand", "commerce", "pickup", "story", "signup"],
    preferredPresets: { Hero: "background", FarmStand: "visit", Pickup: "cards" },
    contentDensity: "medium",
    imageEmphasis: "medium",
    commerceEmphasis: "balanced",
  }),
  studio: define({
    id: "studio",
    name: "Studio",
    description: "Maker-led visual storytelling with a gallery feel.",
    designSystem: "artisan",
    traits: ["maker-led", "gallery", "personal", "process"],
    suitableFor: ["ceramics", "artists", "custom", "limited runs"],
    layoutRecipe: "story_led",
    preferredHomeSlots: ["story", "commerce", "how_it_works", "trust", "signup"],
    preferredPresets: { Hero: "editorial", ImageText: "editorial", ProductGrid: "featured" },
    contentDensity: "low",
    imageEmphasis: "high",
    commerceEmphasis: "story-led",
  }),
  "modern-store": define({
    id: "modern-store",
    name: "Modern Store",
    description: "Polished contemporary ecommerce — balanced brand and shopping.",
    designSystem: "market",
    traits: ["polished", "versatile", "balanced", "contemporary"],
    suitableFor: ["general ecommerce", "growing brands", "multi-category"],
    layoutRecipe: "shop_first",
    preferredHomeSlots: ["commerce", "categories", "story", "trust", "signup"],
    preferredPresets: { Hero: "shop-first", ProductGrid: "classic", CategoryGrid: "cards" },
    contentDensity: "medium",
    imageEmphasis: "medium",
    commerceEmphasis: "balanced",
  }),
  catalogue: define({
    id: "catalogue",
    name: "Catalogue",
    description: "Dense and efficient — built for larger ranges and fast discovery.",
    designSystem: "market",
    traits: ["dense", "category-rich", "commerce-first", "efficient"],
    suitableFor: ["large SKU", "apparel", "specialty retail", "equestrian"],
    layoutRecipe: "browse_catalog",
    preferredHomeSlots: ["categories", "commerce", "trust", "story", "signup"],
    preferredPresets: { Hero: "product-collage", ProductGrid: "compact", CategoryGrid: "compact" },
    contentDensity: "high",
    imageEmphasis: "medium",
    commerceEmphasis: "commerce-led",
  }),
  boutique: define({
    id: "boutique",
    name: "Boutique",
    description: "Premium and curated — warm refinement without stark minimalism.",
    designSystem: "artisan",
    traits: ["premium", "curated", "warm", "refined"],
    suitableFor: ["gifts", "candles", "skincare", "specialty food"],
    layoutRecipe: "story_led",
    preferredHomeSlots: ["commerce", "story", "trust", "signup"],
    preferredPresets: { Hero: "editorial", ProductGrid: "featured", ImageText: "image-left" },
    contentDensity: "low",
    imageEmphasis: "high",
    commerceEmphasis: "balanced",
  }),
};

export function listWebsiteBlueprints(): WebsiteBlueprint[] {
  return WEBSITE_BLUEPRINT_IDS.map((id) => BLUEPRINTS[id]);
}

export function getWebsiteBlueprint(id: WebsiteBlueprintId): WebsiteBlueprint {
  return BLUEPRINTS[id];
}

export function resolveWebsiteBlueprint(
  id: string | null | undefined,
): WebsiteBlueprint | null {
  if (!id || !isWebsiteBlueprintId(id)) return null;
  return BLUEPRINTS[id];
}

export { WEBSITE_BLUEPRINT_IDS, isWebsiteBlueprintId };
