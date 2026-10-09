import type { CSSProperties } from "react";
import type { BusinessMode } from "@/lib/business-mode";
import type { StudioTemplateId } from "./types";
import { defaultTemplateForMode } from "./types";
import { TEMPLATE_TOKENS, tokensToStyle } from "./design-tokens";
import {
  defaultHeroPreset,
  defaultProductPreset,
  HERO_PRESETS,
  PRODUCT_PRESETS,
  CATEGORY_PRESETS,
  NEXT_DROP_PRESETS,
} from "./preset-registry";

export type HeaderVariant = "editorial" | "farm-gate" | "commerce";
export type FooterVariant = "editorial-dark" | "farm-location" | "compact";

export type StudioTemplateDefinition = {
  id: StudioTemplateId;
  label: string;
  tagline: string;
  description: string;
  selectorSubtitle: string;
  audience: string;
  cssClass: string;
  themePreset: "modern" | "farmhouse" | "market";
  headerVariant: HeaderVariant;
  footerVariant: FooterVariant;
  style: CSSProperties & Record<string, string>;
  recommendedBusinessModes: BusinessMode[];
};

export const STUDIO_TEMPLATES: Record<StudioTemplateId, StudioTemplateDefinition> = {
  artisan: {
    id: "artisan",
    label: "Artisan",
    tagline: "Story-led & photographic",
    selectorSubtitle: "Best for bakeries and makers",
    description:
      "Editorial photography, generous whitespace, and premium typography for makers and bakers.",
    audience: "Bakeries, preserves, flowers, premium handmade food",
    cssClass: "studio-template-artisan",
    themePreset: "modern",
    headerVariant: "editorial",
    footerVariant: "editorial-dark",
    style: tokensToStyle(TEMPLATE_TOKENS.artisan),
    recommendedBusinessModes: ["FOOD_BUSINESS", "BOTH"],
  },
  farmhouse: {
    id: "farmhouse",
    label: "Farmhouse",
    tagline: "Warm & local",
    selectorSubtitle: "Best for farm gate and produce",
    description:
      "Natural, trustworthy, contemporary farmhouse feel for stands, produce and rural makers.",
    audience: "Farm stands, eggs, honey, CSA, rural producers",
    cssClass: "studio-template-farmhouse",
    themePreset: "farmhouse",
    headerVariant: "farm-gate",
    footerVariant: "farm-location",
    style: tokensToStyle(TEMPLATE_TOKENS.farmhouse),
    recommendedBusinessModes: ["FARM_STAND", "BOTH"],
  },
  market: {
    id: "market",
    label: "Market",
    tagline: "Clean & product-first",
    selectorSubtitle: "Best for regular selling and larger catalogues",
    description:
      "Bold, efficient commerce layout for prepared food, drops and larger catalogues.",
    audience: "Prepared food, meal makers, market sellers, regular drops",
    cssClass: "studio-template-market",
    themePreset: "market",
    headerVariant: "commerce",
    footerVariant: "compact",
    style: tokensToStyle(TEMPLATE_TOKENS.market),
    recommendedBusinessModes: ["FOOD_BUSINESS", "BOTH"],
  },
};

export function resolveStudioTemplate(
  id: StudioTemplateId | null | undefined,
  businessMode: BusinessMode,
): StudioTemplateDefinition {
  const key = id && id in STUDIO_TEMPLATES ? id : defaultTemplateForMode(businessMode);
  return STUDIO_TEMPLATES[key];
}

export const STUDIO_TEMPLATE_LIST = Object.values(STUDIO_TEMPLATES);

export function templatePresetMaps(templateId: StudioTemplateId) {
  return {
    hero: HERO_PRESETS[templateId],
    products: PRODUCT_PRESETS[templateId],
    categories: CATEGORY_PRESETS[templateId],
    nextDrop: NEXT_DROP_PRESETS[templateId],
    defaults: {
      hero: defaultHeroPreset(templateId),
      products: defaultProductPreset(templateId),
    },
  };
}
