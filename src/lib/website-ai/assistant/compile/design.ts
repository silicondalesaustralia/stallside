import { getWebsiteBlueprint, recommendWebsiteBlueprint, type WebsiteBlueprintId } from "@/lib/website/blueprints";
import { applyBlueprintBrandToTheme } from "@/lib/website-ai/apply-blueprint-brand";
import { heroPresetFromBlueprintHero } from "@/lib/website-ai/blueprint-hero-preset";
import type { WebsiteBusinessContext } from "@/lib/website-ai/types";
import type { StorefrontThemeOverrides } from "@/lib/storefront/types";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { AssistantContext } from "../context/types";
import type { BriefData } from "../brief/schema";
import type { ModelSectionType } from "../ai/schemas";
import { sellerHeroUrl } from "./images";
import { chooseContentHero, chooseHomeHero } from "./hero-choice";

export type DesignChoice = {
  blueprintId: WebsiteBlueprintId;
  templateId: StudioTemplateId;
  /** Home page presets; `hero` is the home hero. */
  presets: Partial<Record<ModelSectionType, string>>;
  /** Hero style for inner pages (About, Contact…). */
  contentHero: string;
  theme: StorefrontThemeOverrides;
};

const LEGACY_PRESET_KEYS: Record<string, ModelSectionType> = {
  ProductGrid: "productGrid",
  CategoryGrid: "categories",
  NextDrop: "nextDrop",
  ImageText: "imageText",
  About: "about",
  Reviews: "reviews",
  Pickup: "pickup",
};

export function legacyContext(ctx: AssistantContext, brief: BriefData): WebsiteBusinessContext {
  return {
    ownerId: ctx.ownerId,
    businessMode: ctx.businessMode,
    businessName: ctx.businessName,
    headline: ctx.existing.headline,
    subheadline: ctx.existing.subheadline,
    about: brief.business.story || ctx.existing.about,
    regionLabel: ctx.existing.regionLabel,
    hasFarmStand: ctx.businessMode === "FARM_STAND" || ctx.businessMode === "BOTH",
    hasMenus: ctx.features.menus.length > 0 || ctx.features.preOrders.length > 0,
    hasDelivery: ctx.features.delivery,
    hasPickup: ctx.features.pickup,
    productCount: ctx.catalogue.productCount,
    categoryCount: ctx.catalogue.categories.length,
    reviewCount: ctx.reviews.count,
    categories: ctx.catalogue.categories,
    featuredProducts: ctx.catalogue.products.slice(0, 8).map((p) => ({ id: p.id, title: p.title })),
    productPhotoCount: ctx.catalogue.productPhotoCount,
    logoUrl: brief.branding.logoUrl,
    heroImageUrl: brief.branding.heroImageUrl,
    accentColor: brief.branding.accentColor,
    secondaryColor: brief.branding.secondaryColor,
    existingTemplateId: ctx.existing.templateId,
    hasExistingStudio: ctx.existing.hasLayout,
  };
}

const GOAL_TO_LEGACY: Record<string, string> = {
  local_visits: "farm-stand",
  pre_orders: "preorders",
  sell_online: "shop",
};

/**
 * Vendl chooses the design internally from real context. Seller-confirmed branding
 * (colours, font) always wins over the starting style's defaults.
 */
export function chooseDesign(ctx: AssistantContext, brief: BriefData): DesignChoice {
  const goal = brief.business.primaryGoal ? GOAL_TO_LEGACY[brief.business.primaryGoal] : undefined;
  const rec = recommendWebsiteBlueprint(legacyContext(ctx, brief), brief.pages.selected, { primaryGoal: goal });
  const bp = getWebsiteBlueprint(rec.recommendedBlueprintId);
  const blueprintHero = heroPresetFromBlueprintHero(bp.layout.hero);
  const sellerPhoto = Boolean(sellerHeroUrl(ctx, brief));
  const presets: DesignChoice["presets"] = { hero: chooseHomeHero(ctx, brief, blueprintHero, sellerPhoto) };
  for (const [legacy, preset] of Object.entries(bp.preferredPresets)) {
    const key = LEGACY_PRESET_KEYS[legacy];
    if (key && preset) presets[key] = preset;
  }
  let theme = applyBlueprintBrandToTheme({}, bp.id, { hasLogo: Boolean(brief.branding.logoUrl) });
  const b = brief.branding;
  if (b.useExisting && b.accentColor && b.secondaryColor) {
    theme = { ...theme, accentColor: b.accentColor, secondaryColor: b.secondaryColor };
    delete theme.paletteId;
  }
  if (b.useExisting && ctx.existing.fontPairId) theme = { ...theme, fontPairId: ctx.existing.fontPairId };
  return {
    blueprintId: bp.id,
    templateId: bp.designSystem,
    presets,
    contentHero: chooseContentHero(blueprintHero, sellerPhoto),
    theme,
  };
}
