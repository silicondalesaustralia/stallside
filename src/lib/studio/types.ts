import type { SerializedNodes } from "@craftjs/core";
import type { BusinessMode } from "@/lib/business-mode";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import type { ShopFulfilmentOptionView } from "@/lib/fulfilment/shop-types";
import type { StorefrontReviewView } from "./load-reviews";
import type {
  CommercePageKind,
  StudioCommerceContext,
} from "./commerce-pages";

export const STUDIO_VERSION = 2 as const;

export type StudioTemplateId = "artisan" | "farmhouse" | "market";

export type StudioPayload = {
  version: typeof STUDIO_VERSION;
  engine: "craft";
  templateId: StudioTemplateId;
  nodes: SerializedNodes;
  pageNodes?: Record<string, SerializedNodes>;
};

export type StudioMetadata = PuckSpikeMetadata & {
  templateId: StudioTemplateId;
  reviews: StorefrontReviewView[];
  fulfilmentOptions: ShopFulfilmentOptionView[];
  standId: string;
  customNavPages: { slug: string; label: string; href: string }[];
  customFooterPages: {
    label: string;
    href: string;
    column: import("./custom-pages").FooterColumnId;
  }[];
  commerceContext?: StudioCommerceContext;
};

export type StudioSectionType =
  | "CraftHeroSection"
  | "CraftProductGridSection"
  | "CraftCategoriesSection"
  | "CraftNextDropSection"
  | "CraftTextSection"
  | "CraftImageSection"
  | "CraftImageTextSection"
  | "CraftAboutSection"
  | "CraftReviewsSection"
  | "CraftPickupSection"
  | "CraftSignupSection"
  | "CraftFarmStandSection"
  | "CraftProductDetailSection"
  | "CraftMenuDetailSection";

export type StudioSectionCategory = "sell" | "content" | "trust" | "grow";

export type StudioSectionRule = {
  type: StudioSectionType;
  label: string;
  description: string;
  category: StudioSectionCategory;
  paletteOrder: number;
  singleton?: boolean;
  required?: boolean;
  duplicable?: boolean;
  deletable?: boolean;
  businessModes?: BusinessMode[];
  /** When set, section only appears on these commerce page editors / pages. */
  commerceKinds?: CommercePageKind[];
  /** When true, section is hidden on commerce page editors (home-only). */
  homeOnly?: boolean;
};

export function defaultTemplateForMode(mode: BusinessMode): StudioTemplateId {
  if (mode === "FARM_STAND") return "farmhouse";
  if (mode === "BOTH") return "farmhouse";
  return "artisan";
}
