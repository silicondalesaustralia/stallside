import type { StudioTemplateId } from "@/lib/studio/types";
import type { HomeSlot, LayoutRecipeId } from "@/lib/website-ai/layout-recipes";
import type { WebsiteAiSectionType } from "@/lib/website-ai/types";

export const WEBSITE_BLUEPRINT_IDS = [
  "editorial",
  "marketplace",
  "heritage",
  "minimal",
  "bold",
  "local",
  "studio",
  "modern-store",
  "catalogue",
  "boutique",
] as const;

export type WebsiteBlueprintId = (typeof WEBSITE_BLUEPRINT_IDS)[number];

export type BlueprintContentDensity = "low" | "medium" | "high";
export type BlueprintImageEmphasis = "low" | "medium" | "high";
export type BlueprintCommerceEmphasis = "story-led" | "balanced" | "commerce-led";

export type WebsiteBlueprint = {
  id: WebsiteBlueprintId;
  name: string;
  description: string;
  designSystem: StudioTemplateId;
  traits: string[];
  suitableFor: string[];
  /** Maps onto existing recipe slot engine for composition. */
  layoutRecipe: LayoutRecipeId;
  preferredHomeSlots: HomeSlot[];
  preferredPresets: Partial<Record<WebsiteAiSectionType, string>>;
  contentDensity: BlueprintContentDensity;
  imageEmphasis: BlueprintImageEmphasis;
  commerceEmphasis: BlueprintCommerceEmphasis;
  previewTone: {
    bg: string;
    ink: string;
    muted: string;
    accent: string;
    wash: string;
    heroStyle: "split" | "full" | "minimal" | "bold" | "collage";
    productCols: 2 | 3 | 4;
    cardRadius: string;
  };
};

export type BlueprintRecommendReason =
  | "LARGE_CATALOGUE"
  | "STRONG_PHOTOGRAPHY"
  | "LOCAL_PHYSICAL_SELLING"
  | "STORY_RICH"
  | "CUSTOM_PRODUCT_BUSINESS"
  | "PREMIUM_SMALL_CATALOGUE"
  | "GENERAL_ECOMMERCE"
  | "PREORDER_MENU"
  | "SELLER_STYLE_HINT";

export type BlueprintRecommendation = {
  recommendedBlueprintId: WebsiteBlueprintId;
  confidence: "high" | "medium" | "low";
  reasonCodes: BlueprintRecommendReason[];
  userFacingReason: string;
};

export function isWebsiteBlueprintId(value: string): value is WebsiteBlueprintId {
  return (WEBSITE_BLUEPRINT_IDS as readonly string[]).includes(value);
}
