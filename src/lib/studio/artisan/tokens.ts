/** Artisan template design tokens — applied via `.studio-template-artisan` in globals.css */
export const ARTISAN_TOKENS = {
  "--studio-font-display": "var(--font-display)",
  "--studio-font-body": "var(--font-sans)",
  "--studio-section-py": "4.5rem",
  "--studio-section-py-mobile": "3rem",
  "--studio-content-max": "72rem",
  "--studio-prose-max": "42rem",
  "--studio-heading-tracking": "-0.025em",
  "--studio-heading-weight": "700",
  "--studio-card-radius": "1rem",
  "--studio-hero-min-height": "32rem",
  "--studio-hero-min-height-mobile": "24rem",
  "--studio-btn-height": "2.75rem",
  "--studio-section-gap": "0",
} as const;

export type HeroLayout = "editorial" | "split" | "background" | "minimal";
export type ProductPreset = "editorial" | "classic" | "featured" | "compact";
export type CategoryPreset = "tiles" | "cards" | "compact" | "minimal";
export type NextDropPreset = "featured" | "card" | "preview" | "timeline";
export type AboutPreset = "simple" | "card" | "editorial";
export type ImageTextPreset = "image-left" | "image-right" | "editorial" | "wide";
