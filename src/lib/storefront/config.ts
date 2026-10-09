import type { BusinessMode } from "@/lib/business-mode";
import {
  STOREFRONT_PAGE_IDS,
  STOREFRONT_SECTION_IDS,
  type StorefrontConfig,
  type StorefrontSection,
  type StorefrontSectionId,
} from "@/lib/storefront/types";

const SECTION_LABELS: Record<StorefrontSectionId, string> = {
  hero: "Hero",
  featured_products: "Featured products",
  categories: "Categories",
  about: "About us",
  how_ordering: "How ordering works",
  pickup_delivery: "Pickup & delivery",
  farm_stand: "Farm stand",
  gallery: "Gallery",
  testimonials: "Testimonials",
  contact: "Contact",
  social: "Social links",
};

export function storefrontSectionLabel(id: StorefrontSectionId): string {
  return SECTION_LABELS[id];
}

function defaultSectionEnabled(
  id: StorefrontSectionId,
  mode: BusinessMode,
  fulfilmentIntents: string[],
): boolean {
  switch (id) {
    case "hero":
    case "featured_products":
    case "how_ordering":
    case "contact":
    case "social":
      return true;
    case "categories":
    case "about":
      return true;
    case "pickup_delivery":
      return (
        fulfilmentIntents.includes("pickup") ||
        fulfilmentIntents.includes("delivery")
      );
    case "farm_stand":
      return mode === "FARM_STAND" || mode === "BOTH";
    case "gallery":
    case "testimonials":
      return false;
    default:
      return false;
  }
}

export function buildDefaultStorefrontConfig(input: {
  businessMode: BusinessMode;
  fulfilmentIntents: string[];
}): StorefrontConfig {
  const sections: StorefrontSection[] = STOREFRONT_SECTION_IDS.map(
    (id, order) => ({
      id,
      enabled: defaultSectionEnabled(
        id,
        input.businessMode,
        input.fulfilmentIntents,
      ),
      order,
    }),
  );

  const pages = Object.fromEntries(
    STOREFRONT_PAGE_IDS.map((id) => [id, { enabled: true }]),
  ) as StorefrontConfig["pages"];

  return { sections, pages, galleryImages: [], featuredProductIds: [] };
}

export function parseStorefrontConfig(raw: unknown): StorefrontConfig {
  if (!raw || typeof raw !== "object") {
    return buildDefaultStorefrontConfig({
      businessMode: "FOOD_BUSINESS",
      fulfilmentIntents: ["pickup"],
    });
  }
  const obj = raw as Partial<StorefrontConfig>;
  const fallback = buildDefaultStorefrontConfig({
    businessMode: "FOOD_BUSINESS",
    fulfilmentIntents: ["pickup"],
  });

  const sections = Array.isArray(obj.sections)
    ? obj.sections
        .filter(
          (s): s is StorefrontSection =>
            Boolean(s) &&
            typeof s === "object" &&
            typeof (s as StorefrontSection).id === "string",
        )
        .map((s, i) => ({
          id: s.id,
          enabled: Boolean(s.enabled),
          order: typeof s.order === "number" ? s.order : i,
          props: s.props,
        }))
    : fallback.sections;

  const pages = { ...fallback.pages, ...(obj.pages ?? {}) };

  return {
    sections: sections.sort((a, b) => a.order - b.order),
    pages,
    featuredProductIds: obj.featuredProductIds ?? [],
    galleryImages: obj.galleryImages ?? [],
    themeOverrides: obj.themeOverrides,
  };
}

export function mergeStorefrontConfig(
  base: StorefrontConfig,
  patch: Partial<StorefrontConfig>,
): StorefrontConfig {
  return {
    sections: patch.sections ?? base.sections,
    pages: { ...base.pages, ...(patch.pages ?? {}) },
    featuredProductIds: patch.featuredProductIds ?? base.featuredProductIds,
    galleryImages: patch.galleryImages ?? base.galleryImages,
    themeOverrides: { ...base.themeOverrides, ...patch.themeOverrides },
  };
}

export function enabledSections(config: StorefrontConfig): StorefrontSection[] {
  return config.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}
