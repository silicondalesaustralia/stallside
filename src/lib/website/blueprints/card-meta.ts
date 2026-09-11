import type { BlueprintAssetNeeds } from "./layout-types";
import type { WebsiteBlueprintId } from "./types";

export const BLUEPRINT_CARD_META: Record<
  WebsiteBlueprintId,
  {
    cardDescription: string;
    layoutTags: [string, string, string];
    assetNeeds: BlueprintAssetNeeds;
  }
> = {
  editorial: {
    cardDescription: "Big type, wide imagery, calm and spacious.",
    layoutTags: ["Stacked hero", "Feature rows", "3-col grid"],
    assetNeeds: { minPhotos: 6, minProductsWithPhotos: 4, usesCutouts: false },
  },
  marketplace: {
    cardDescription: "Categories up front, easy to browse and buy.",
    layoutTags: ["Category-tile hero", "Product rows", "Category grid"],
    assetNeeds: { minPhotos: 4, minProductsWithPhotos: 6, usesCutouts: false },
  },
  heritage: {
    cardDescription: "Warm and story-led, with a classic feel.",
    layoutTags: ["Arch hero", "Story columns", "Menu-style list"],
    assetNeeds: { minPhotos: 3, minProductsWithPhotos: 4, usesCutouts: false },
  },
  minimal: {
    cardDescription: "Quiet layout that lets products do the talking.",
    layoutTags: ["Framed hero", "2-col large grid", "One-line footer"],
    assetNeeds: { minPhotos: 6, minProductsWithPhotos: 4, usesCutouts: false },
  },
  bold: {
    cardDescription: "Loud type and colour blocks with punchy CTAs.",
    layoutTags: ["Type-block hero", "Colour blocks", "4-col grid"],
    assetNeeds: { minPhotos: 3, minProductsWithPhotos: 4, usesCutouts: true },
  },
  local: {
    cardDescription: "Hours, pickup and what’s available, first.",
    layoutTags: ["Visit-card hero", "Available now", "Pickup & delivery"],
    assetNeeds: { minPhotos: 2, minProductsWithPhotos: 3, usesCutouts: false },
  },
  studio: {
    cardDescription: "Gallery-style, built around process and craft.",
    layoutTags: ["Collage hero", "Process steps", "Masonry gallery"],
    assetNeeds: { minPhotos: 8, minProductsWithPhotos: 3, usesCutouts: false },
  },
  "modern-store": {
    cardDescription: "Polished and balanced between brand and shop.",
    layoutTags: ["Split hero", "Category cards", "Tabbed grid"],
    assetNeeds: { minPhotos: 4, minProductsWithPhotos: 4, usesCutouts: false },
  },
  catalogue: {
    cardDescription: "Dense and fast for larger ranges.",
    layoutTags: ["Promo banner", "Category chips", "6-col dense grid"],
    assetNeeds: { minPhotos: 4, minProductsWithPhotos: 8, usesCutouts: false },
  },
  boutique: {
    cardDescription: "Soft, curated and gift-ready.",
    layoutTags: ["Product hero", "Curated sets", "Soft cards"],
    assetNeeds: { minPhotos: 5, minProductsWithPhotos: 4, usesCutouts: false },
  },
};
