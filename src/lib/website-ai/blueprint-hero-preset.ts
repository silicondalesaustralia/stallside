import type { HeroVariant } from "@/lib/website/blueprints/layout-types";
import type { HeroPreset } from "@/lib/studio/preset-registry";

/** Map starting-style hero variants onto Craft/Studio hero presets. */
export function heroPresetFromBlueprintHero(hero: HeroVariant): HeroPreset {
  switch (hero) {
    case "FULL_BLEED":
    case "TYPE_BLOCK":
    case "PROMO_BANNER":
      return "background";
    case "SPLIT_CATEGORY_TILES":
    case "SPLIT_MEDIA":
    case "PRODUCT_FEATURE":
      return "split";
    case "EDITORIAL_STACK":
      return "editorial";
    case "FRAMED_INSET":
      return "minimal";
    case "ARCH_FRAME":
      return "farm-landscape";
    case "INFO_PANEL":
      return "stand-status";
    case "COLLAGE_TRIO":
      return "product-collage";
    default:
      return "background";
  }
}
