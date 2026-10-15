import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { mapCategoryPreset, type CategoryLook, type CategoryPreset } from "./preset-registry";

export type CategoryTileData = PuckSpikeMetadata["categories"][number];
export type CategoryCardBackground = "white" | "none";
export type CategoryTileOptions = {
  showDescriptions: boolean;
  showRatings: boolean;
  isEditing?: boolean;
  /** "none" drops the white fill and border so cards sit on the section background. */
  cardBackground?: CategoryCardBackground;
};

export function parseCategoryCardBackground(value: unknown): CategoryCardBackground {
  return value === "none" ? "none" : "white";
}

/** Looks drawn as a filled box, which can drop their white background. */
export function categoryLookHasCard(look: CategoryLook): boolean {
  return look === "cards" || look === "list" || look === "compact";
}

const LOOKS: readonly CategoryPreset[] = [
  "tiles",
  "cards",
  "compact",
  "minimal",
  "produce-tiles",
  "shop-cards",
  "horizontal",
  "overlay",
  "circles",
  "list",
  "banner",
];

/** The look a saved Categories preset renders as; unknown values fall back to tiles. */
export function categoryLookOf(preset: string | undefined): CategoryLook {
  const known = LOOKS.find((l) => l === preset);
  return known ? mapCategoryPreset("artisan", known) : "tiles";
}

const GRID: Record<CategoryLook, string> = {
  tiles: "grid grid-cols-2 gap-4 sf-sm:grid-cols-3",
  cards: "grid grid-cols-1 gap-4 sf-sm:grid-cols-2 sf-lg:grid-cols-3",
  overlay: "grid grid-cols-1 gap-4 sf-sm:grid-cols-2 sf-lg:grid-cols-3",
  circles: "grid grid-cols-3 gap-x-4 gap-y-6 sf-sm:grid-cols-4 sf-lg:grid-cols-6",
  list: "grid grid-cols-1 gap-3 sf-md:grid-cols-2",
  banner: "grid grid-cols-1 gap-4",
  horizontal:
    "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [&>li]:w-[70%] [&>li]:shrink-0 [&>li]:snap-start sf-sm:[&>li]:w-[42%] sf-lg:[&>li]:w-[28%]",
  compact: "flex flex-wrap gap-2",
  minimal: "flex flex-wrap gap-x-6 gap-y-2",
};

export function categoryGridClassFor(look: CategoryLook): string {
  return GRID[look];
}

/** Looks with no room for a description line. */
export function categoryLookIsSlim(look: CategoryLook): boolean {
  return look === "compact" || look === "minimal" || look === "circles";
}
