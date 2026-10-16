import type { CSSProperties } from "react";
import { isButtonLink } from "./button-link";

export const HERO_HEIGHTS = ["small", "medium", "large"] as const;
export const HERO_ALIGNS = ["auto", "left", "centre"] as const;
export const HERO_OVERLAYS = ["light", "medium", "strong"] as const;
export const HERO_IMAGE_SIDES = ["right", "left"] as const;

export type HeroLook = {
  height: (typeof HERO_HEIGHTS)[number];
  align: (typeof HERO_ALIGNS)[number];
  overlay: (typeof HERO_OVERLAYS)[number];
  imageSide: (typeof HERO_IMAGE_SIDES)[number];
  /** On phones, put the text under the photo instead of on it. */
  mobileTextBelow: boolean;
  secondaryLabel: string;
  secondaryLink: string | undefined;
};

function pick<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return typeof value === "string" && (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Hero look settings from saved props; missing values keep the original look. */
export function parseHeroLook(props: Record<string, unknown>): HeroLook {
  const label = typeof props.secondaryLabel === "string" ? props.secondaryLabel.trim().slice(0, 40) : "";
  return {
    height: pick(HERO_HEIGHTS, props.height, "medium"),
    align: pick(HERO_ALIGNS, props.align, "auto"),
    overlay: pick(HERO_OVERLAYS, props.overlay, "medium"),
    imageSide: pick(HERO_IMAGE_SIDES, props.imageSide, "right"),
    mobileTextBelow: props.mobileTextBelow === true,
    secondaryLabel: label,
    secondaryLink: isButtonLink(props.secondaryLink) ? props.secondaryLink : undefined,
  };
}

const HEIGHTS: Record<HeroLook["height"], CSSProperties | undefined> = {
  small: {
    "--studio-hero-min-height": "18rem",
    "--studio-hero-min-height-mobile": "14rem",
    "--studio-hero-split-min": "20rem",
  } as CSSProperties,
  medium: undefined,
  large: {
    "--studio-hero-min-height": "40rem",
    "--studio-hero-min-height-mobile": "26rem",
    "--studio-hero-split-min": "40rem",
  } as CSSProperties,
};

/** Medium keeps the template's own height; phones never go full screen. */
export function heroHeightStyle(look: HeroLook): CSSProperties | undefined {
  return HEIGHTS[look.height];
}

const OVERLAYS: Record<"farm" | "plain", Record<HeroLook["overlay"], string>> = {
  farm: {
    light: "bg-gradient-to-t from-[#1f2e1f]/65 via-[#1f2e1f]/30 to-transparent",
    medium: "bg-gradient-to-t from-[#1f2e1f]/75 via-[#1f2e1f]/40 to-transparent",
    strong: "bg-gradient-to-t from-[#1f2e1f]/85 via-[#1f2e1f]/65 to-[#1f2e1f]/45",
  },
  plain: {
    light: "bg-gradient-to-t from-black/65 via-black/30 to-transparent",
    medium: "bg-gradient-to-t from-black/70 via-black/45 to-black/25",
    strong: "bg-gradient-to-t from-black/85 via-black/65 to-black/45",
  },
};

/** Every fade keeps the text area dark enough to read white text. */
export function heroOverlayClass(look: HeroLook, farm: boolean): string {
  return OVERLAYS[farm ? "farm" : "plain"][look.overlay];
}
