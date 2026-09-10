import type { BusinessMode } from "@/lib/business-mode";
import type { StudioSectionType, StudioTemplateId } from "@/lib/studio/types";

export const WEBSITE_AI_SPEC_VERSION = 1 as const;

export type WebsitePageType =
  | "HOME"
  | "ABOUT"
  | "CONTACT"
  | "FAQ"
  | "SHOP"
  | "CATEGORY"
  | "PRODUCT"
  | "MENU"
  | "SUBSCRIPTIONS"
  | "FARM_STAND"
  | "EVENTS"
  | "REVIEWS"
  | "BLOG_INDEX"
  | "BLOG_POST"
  | "CUSTOM_INFO"
  | "PRIVACY"
  | "TERMS"
  | "SHIPPING_PICKUP"
  | "REFUNDS";

export type WebsiteAiSectionType =
  | "Hero"
  | "ProductGrid"
  | "CategoryGrid"
  | "NextDrop"
  | "FarmStand"
  | "ImageText"
  | "About"
  | "Reviews"
  | "Pickup"
  | "Signup"
  | "Text"
  | "Image";

export type WebsiteDataSourceId =
  | "FEATURED_PRODUCTS"
  | "LATEST_PRODUCTS"
  | "CATEGORY"
  | "CURRENT_MENU"
  | "NEXT_DROP"
  | "NEXT_AVAILABLE_PICKUP"
  | "PRIMARY_STAND"
  | "PICKUP_LOCATIONS"
  | "DELIVERY_ZONES"
  | "TOP_REVIEWS"
  | "ACTIVE_SUBSCRIPTIONS"
  | "UPCOMING_EVENTS"
  | "LATEST_BLOG_POSTS";

export type WebsiteGenerationIntent = {
  primaryGoal?: string;
  secondaryGoals?: string[];
  stylePreference?: string;
  sellerNotes?: string;
  selectedFocusEntities?: string[];
  /** Seller-provided About / story copy for this generation. */
  sellerAbout?: string;
  /** Uploaded story/about image URL for ImageText sections. */
  storyImageUrl?: string;
};

export type AiSectionConfig = {
  id: string;
  type: WebsiteAiSectionType;
  preset?: string;
  heading?: string;
  body?: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  dataSource?: WebsiteDataSourceId;
  props?: Record<string, string | number | boolean | string[]>;
};

export type AiSitePage = {
  pageType: WebsitePageType;
  title: string;
  slug?: string;
  sections: AiSectionConfig[];
  seo?: { title?: string; description?: string };
};

export type AISitePlan = {
  version: typeof WEBSITE_AI_SPEC_VERSION;
  designSystem: StudioTemplateId;
  siteStrategy: {
    primaryGoal: string;
    audienceSummary: string;
    contentPriorities: string[];
  };
  navigation: { label: string; pageType: WebsitePageType }[];
  pages: AiSitePage[];
  missingInformation?: { code: string; message: string; blocking: boolean }[];
  changeSummary?: string;
};

export type WebsiteBusinessContext = {
  ownerId: string;
  businessMode: BusinessMode;
  businessName: string;
  headline: string;
  subheadline: string | null;
  about: string | null;
  regionLabel: string | null;
  hasFarmStand: boolean;
  hasMenus: boolean;
  hasDelivery: boolean;
  hasPickup: boolean;
  productCount: number;
  categoryCount: number;
  reviewCount: number;
  categories: { id: string; title: string; slug: string }[];
  featuredProducts: { id: string; title: string }[];
  productPhotoCount: number;
  logoUrl: string | null;
  heroImageUrl: string | null;
  existingTemplateId: StudioTemplateId | null;
  hasExistingStudio: boolean;
};

export type SiteGenerationInput = {
  businessContext: WebsiteBusinessContext;
  intent?: WebsiteGenerationIntent;
};

export type SiteGenerationResult =
  | { ok: true; plan: AISitePlan; provider: string; model: string }
  | { ok: false; error: string; provider: string };

export type StudioSectionFromAi = {
  craftType: StudioSectionType;
  props: Record<string, unknown>;
};
