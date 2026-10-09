import {
  CATEGORY_PRESETS,
  HERO_PRESETS,
  NEXT_DROP_PRESETS,
  PRODUCT_PRESETS,
  type PresetOption,
} from "@/lib/studio/preset-registry";
import type { StudioTemplateId } from "@/lib/studio/types";

function allValues<T extends string>(bySkin: Record<StudioTemplateId, PresetOption<T>[]>): T[] {
  return [...new Set(Object.values(bySkin).flatMap((list) => list.map((o) => o.value)))];
}

export const HERO_VARIANTS = allValues(HERO_PRESETS);
/** "classic"/"editorial" etc. are also accepted by the shared product renderer. */
export const PRODUCT_VARIANTS = [
  ...new Set([...allValues(PRODUCT_PRESETS), "editorial", "classic", "featured", "compact"]),
];
export const CATEGORY_VARIANTS = [
  ...new Set([...allValues(CATEGORY_PRESETS), "tiles", "cards", "compact", "minimal"]),
];
export const NEXT_DROP_VARIANTS = allValues(NEXT_DROP_PRESETS);
export const REVIEWS_VARIANTS = ["cards", "quote", "featured", "rating-row"] as const;
export const PICKUP_VARIANTS = ["cards", "simple", "split", "visit-stand", "info-band"] as const;
export const IMAGE_TEXT_VARIANTS = [
  "image-left",
  "image-right",
  "editorial",
  "wide",
  "farm-story",
] as const;
export const IMAGE_VARIANTS = ["full", "contained", "wide"] as const;
export const ABOUT_VARIANTS = ["simple", "card"] as const;
export const DEFAULT_ONLY = ["default"] as const;
