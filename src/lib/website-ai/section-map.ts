import type { StudioSectionType, StudioTemplateId } from "@/lib/studio/types";
import {
  defaultHeroPreset,
  defaultProductPreset,
} from "@/lib/studio/preset-registry";
import type { AiSectionConfig, WebsiteAiSectionType } from "./types";

export const AI_TO_CRAFT_SECTION: Record<WebsiteAiSectionType, StudioSectionType> =
  {
    Hero: "CraftHeroSection",
    ProductGrid: "CraftProductGridSection",
    CategoryGrid: "CraftCategoriesSection",
    NextDrop: "CraftNextDropSection",
    FarmStand: "CraftFarmStandSection",
    ImageText: "CraftImageTextSection",
    About: "CraftAboutSection",
    Reviews: "CraftReviewsSection",
    Pickup: "CraftPickupSection",
    Signup: "CraftSignupSection",
    Text: "CraftTextSection",
    Image: "CraftImageSection",
  };

export const HOME_AI_SECTIONS: WebsiteAiSectionType[] = [
  "Hero",
  "ProductGrid",
  "CategoryGrid",
  "NextDrop",
  "FarmStand",
  "ImageText",
  "About",
  "Reviews",
  "Pickup",
  "Signup",
  "Text",
  "Image",
];

export function craftPropsForAiSection(
  section: AiSectionConfig,
  templateId: StudioTemplateId,
): Record<string, unknown> {
  const craftType = AI_TO_CRAFT_SECTION[section.type];
  const extra = section.props ?? {};

  switch (craftType) {
    case "CraftHeroSection":
      return {
        headline: section.headline ?? section.heading ?? "",
        supportingText: section.subheadline ?? section.body ?? "",
        layout: section.preset ?? defaultHeroPreset(templateId),
        ctaLabel: section.ctaLabel ?? "Browse",
        showCta: true,
        ...extra,
      };
    case "CraftProductGridSection":
      return {
        source: "all",
        categoryId: "",
        productIds: [],
        limit: templateId === "market" ? 12 : 8,
        layout: "grid",
        columns: templateId === "market" ? 4 : 3,
        preset: section.preset ?? defaultProductPreset(templateId),
        heading: section.heading ?? "Our products",
        showPrice: true,
        showAvailability: true,
        ...extra,
      };
    case "CraftCategoriesSection":
      return {
        source: "all",
        categoryIds: [],
        preset:
          section.preset ??
          (templateId === "farmhouse"
            ? "produce-tiles"
            : templateId === "market"
              ? "shop-cards"
              : "tiles"),
        heading: section.heading ?? "Browse categories",
        ...extra,
      };
    case "CraftNextDropSection":
      return {
        maxItems: templateId === "market" ? 3 : 1,
        showClosingDate: true,
        showPickupDate: true,
        preset:
          section.preset ??
          (templateId === "farmhouse"
            ? "next-collection"
            : templateId === "market"
              ? "current-menu"
              : "featured"),
        heading: section.heading ?? "Next drop",
        ...extra,
      };
    case "CraftFarmStandSection":
      return {
        heading: section.heading ?? "Visit the stand",
        showHours: true,
        showLocation: true,
        showDirections: true,
        ...extra,
      };
    case "CraftImageTextSection":
      return {
        imageUrl: "",
        heading: section.heading ?? "Our story",
        body: section.body ?? "",
        layout: section.preset ?? "image-left",
        ctaLabel: section.ctaLabel ?? "",
        ...extra,
      };
    case "CraftAboutSection":
      return {
        heading: section.heading ?? "About us",
        body: section.body ?? "",
        layout: section.preset ?? "simple",
        ...extra,
      };
    case "CraftReviewsSection":
      return {
        preset: section.preset ?? "cards",
        heading: section.heading ?? "What customers say",
        maxItems: 4,
        ...extra,
      };
    case "CraftPickupSection":
      return {
        preset:
          section.preset ??
          (templateId === "farmhouse" ? "visit-stand" : "cards"),
        heading: section.heading ?? "Pickup & delivery",
        ...extra,
      };
    case "CraftSignupSection":
      return {
        heading: section.heading ?? "Stay in the loop",
        body: section.body ?? "Get updates on menus, drops and restocks.",
        buttonLabel: section.ctaLabel ?? "Subscribe",
        ...extra,
      };
    case "CraftTextSection":
      return {
        heading: section.heading ?? "",
        body: section.body ?? "",
        alignment: "left",
        ...extra,
      };
    case "CraftImageSection":
      return {
        imageUrl: "",
        alt: section.heading ?? "",
        caption: section.body ?? "",
        layout: "contained",
        ...extra,
      };
    default:
      return { ...extra };
  }
}
