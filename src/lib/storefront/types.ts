export const STOREFRONT_THEME_PRESETS = [
  "farmhouse",
  "market",
  "minimal",
  "modern",
] as const;

export type StorefrontThemePreset = (typeof STOREFRONT_THEME_PRESETS)[number];

export const STOREFRONT_SECTION_IDS = [
  "hero",
  "featured_products",
  "categories",
  "about",
  "how_ordering",
  "pickup_delivery",
  "farm_stand",
  "gallery",
  "testimonials",
  "contact",
  "social",
] as const;

export type StorefrontSectionId = (typeof STOREFRONT_SECTION_IDS)[number];

export const STOREFRONT_PAGE_IDS = ["home", "shop", "about", "contact"] as const;

export type StorefrontPageId = (typeof STOREFRONT_PAGE_IDS)[number];

export type StorefrontSection = {
  id: StorefrontSectionId;
  enabled: boolean;
  order: number;
  props?: Record<string, unknown>;
};

export type StorefrontPageConfig = {
  enabled: boolean;
  body?: string;
};

export type StorefrontThemeOverrides = {
  accentColor?: string;
  secondaryColor?: string;
  buttonStyle?: "pill" | "rounded";
};

export type StorefrontConfig = {
  sections: StorefrontSection[];
  pages: Record<StorefrontPageId, StorefrontPageConfig>;
  featuredProductIds?: string[];
  galleryImages?: string[];
  themeOverrides?: StorefrontThemeOverrides;
};

export type ResolvedStorefrontBranding = {
  businessName: string;
  headline: string;
  subheadline: string | null;
  about: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  accentColor: string;
  secondaryColor: string;
  buttonStyle: "pill" | "rounded";
  themePreset: StorefrontThemePreset;
  regionLabel: string | null;
  contactEmail: string;
  contactPhone: string | null;
  showPhone: boolean;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
};
