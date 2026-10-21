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
  /** Homepage layout. Absent until the homepage itself has been saved. */
  nodes?: SerializedNodes;
  pageNodes?: Record<string, SerializedNodes>;
};

export type StudioMetadata = PuckSpikeMetadata & {
  templateId: StudioTemplateId;
  reviews: StorefrontReviewView[];
  fulfilmentOptions: ShopFulfilmentOptionView[];
  standId: string;
  customNavPages: import("./navigation").StudioNavItem[];
  /** Every enabled custom page (for link pickers), in or out of the automatic menu. */
  linkablePages: { slug: string; label: string; href: string }[];
  /** Active subscription and membership offers, for link pickers. */
  offerPages?: import("./load-link-targets").OfferLinkTarget[];
  /** Active pre-order pages, for link pickers. */
  preOrderPages?: import("./load-link-targets").PreOrderLinkTarget[];
  /** The seller's own header menu, or null for the automatic one. */
  headerMenu: import("./header-menu").HeaderMenu | null;
  announcementBar: import("./announcement-bar").AnnouncementBar | null;
  /** The seller's footer wording, links and colours, or null for the automatic footer. */
  footer: import("./footer-settings").FooterSettings | null;
  /** Payment methods customers can actually use right now (stand toggles + connected providers). */
  paymentBrands: import("@/lib/payment-brand-assets").PaymentBrand[];
  customFooterPages: {
    slug: string;
    label: string;
    href: string;
    column: import("./custom-pages").FooterColumnId;
  }[];
  commerceContext?: StudioCommerceContext;
  /** Opening hours from the search profile, for live open/closed wording. */
  standHours?: { hours: import("./open-status").StandHours; timeZone: string } | null;
  /** Map link for "Get directions": the seller's map link, else a search for their suburb. */
  directionsUrl?: string | null;
  /** Suburb or town for "visit us" wording. */
  locality?: string | null;
  /** Draft revision the editor loaded; sent back on save to detect conflicts. */
  draftRevision: number;
};

export type StudioSectionType =
  | "CraftHeroSection"
  | "CraftProductGridSection"
  | "CraftCategoriesSection"
  | "CraftNextDropSection"
  | "CraftTextSection"
  | "CraftFaqSection"
  | "CraftContactFormSection"
  | "CraftImageSection"
  | "CraftImageTextSection"
  | "CraftAboutSection"
  | "CraftReviewsSection"
  | "CraftPickupSection"
  | "CraftSignupSection"
  | "CraftFarmStandSection"
  | "CraftPaymentsSection"
  | "CraftProductDetailSection"
  | "CraftCategoryDetailSection"
  | "CraftSpacerSection"
  | "CraftMenuDetailSection"
  | "CraftPreOrderSection"
  | "CraftSubscriptionSection"
  | "CraftCartSection"
  | "CraftOrderConfirmationSection";

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
