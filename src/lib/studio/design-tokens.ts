import type { CSSProperties } from "react";
import type { StudioTemplateId } from "./types";

/** Shared semantic design tokens — mapped to CSS custom properties on `.studio-template-*` */
export type SiteDesignTokens = {
  "--site-bg": string;
  "--site-surface": string;
  "--site-surface-alt": string;
  "--site-text": string;
  "--site-text-muted": string;
  "--site-accent": string;
  "--site-border": string;
  "--content-max": string;
  "--content-narrow": string;
  "--content-wide": string;
  "--space-section-desktop": string;
  "--space-section-mobile": string;
  "--radius-card": string;
  "--radius-button": string;
  "--shadow-card": string;
  "--image-product-ratio": string;
  "--image-category-ratio": string;
  "--studio-heading-tracking": string;
  "--studio-heading-weight": string;
  "--studio-hero-min-height": string;
  "--studio-hero-min-height-mobile": string;
  "--studio-btn-height": string;
  "--studio-prose-max": string;
};

export const ARTISAN_TOKENS: SiteDesignTokens = {
  "--site-bg": "#faf8f5",
  "--site-surface": "#ffffff",
  "--site-surface-alt": "#f3efe8",
  "--site-text": "#2a2118",
  "--site-text-muted": "#6b5f52",
  "--site-accent": "#b8860b",
  "--site-border": "#e8dfd3",
  "--content-max": "75rem",
  "--content-narrow": "42.5rem",
  "--content-wide": "85rem",
  "--space-section-desktop": "5.5rem",
  "--space-section-mobile": "3rem",
  "--radius-card": "1rem",
  "--radius-button": "9999px",
  "--shadow-card": "none",
  "--image-product-ratio": "4 / 5",
  "--image-category-ratio": "4 / 3",
  "--studio-heading-tracking": "-0.025em",
  "--studio-heading-weight": "700",
  "--studio-hero-min-height": "32rem",
  "--studio-hero-min-height-mobile": "24rem",
  "--studio-btn-height": "2.75rem",
  "--studio-prose-max": "42rem",
};

export const FARMHOUSE_TOKENS: SiteDesignTokens = {
  "--site-bg": "#f7f3ea",
  "--site-surface": "#fffef9",
  "--site-surface-alt": "#e8ebe3",
  "--site-text": "#1f2e1f",
  "--site-text-muted": "#5c6358",
  "--site-accent": "#a0522d",
  "--site-border": "#d4cfc0",
  "--content-max": "72rem",
  "--content-narrow": "40rem",
  "--content-wide": "80rem",
  "--space-section-desktop": "4.5rem",
  "--space-section-mobile": "2.75rem",
  "--radius-card": "0.75rem",
  "--radius-button": "0.5rem",
  "--shadow-card": "0 1px 3px rgb(0 0 0 / 0.06)",
  "--image-product-ratio": "1 / 1",
  "--image-category-ratio": "4 / 3",
  "--studio-heading-tracking": "-0.01em",
  "--studio-heading-weight": "650",
  "--studio-hero-min-height": "28rem",
  "--studio-hero-min-height-mobile": "22rem",
  "--studio-btn-height": "2.75rem",
  "--studio-prose-max": "40rem",
};

export const MARKET_TOKENS: SiteDesignTokens = {
  "--site-bg": "#fafafa",
  "--site-surface": "#ffffff",
  "--site-surface-alt": "#f4f4f5",
  "--site-text": "#18181b",
  "--site-text-muted": "#71717a",
  "--site-accent": "var(--leaf-dark)",
  "--site-border": "#e4e4e7",
  "--content-max": "80rem",
  "--content-narrow": "42rem",
  "--content-wide": "90rem",
  "--space-section-desktop": "3.5rem",
  "--space-section-mobile": "2.5rem",
  "--radius-card": "0.625rem",
  "--radius-button": "0.5rem",
  "--shadow-card": "0 1px 2px rgb(0 0 0 / 0.05)",
  "--image-product-ratio": "1 / 1",
  "--image-category-ratio": "3 / 2",
  "--studio-heading-tracking": "-0.015em",
  "--studio-heading-weight": "700",
  "--studio-hero-min-height": "20rem",
  "--studio-hero-min-height-mobile": "16rem",
  "--studio-btn-height": "2.5rem",
  "--studio-prose-max": "42rem",
};

export const TEMPLATE_TOKENS: Record<StudioTemplateId, SiteDesignTokens> = {
  artisan: ARTISAN_TOKENS,
  farmhouse: FARMHOUSE_TOKENS,
  market: MARKET_TOKENS,
};

export function tokensToStyle(tokens: SiteDesignTokens): CSSProperties & Record<string, string> {
  return {
    ...tokens,
    "--studio-content-max": tokens["--content-max"],
    "--studio-section-py": tokens["--space-section-desktop"],
    "--studio-section-py-mobile": tokens["--space-section-mobile"],
    "--studio-card-radius": tokens["--radius-card"],
  };
}
