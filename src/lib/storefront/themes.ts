import type { StorefrontThemePreset } from "@/lib/storefront/types";

export type StorefrontThemeTokens = {
  id: StorefrontThemePreset;
  label: string;
  description: string;
  accent: string;
  secondary: string;
  heroStyle: "gradient" | "photo" | "minimal";
  cardRadius: string;
  buttonStyle: "pill" | "rounded";
  fontWeight: "normal" | "medium";
};

export const STOREFRONT_THEMES: Record<
  StorefrontThemePreset,
  StorefrontThemeTokens
> = {
  farmhouse: {
    id: "farmhouse",
    label: "Farmhouse",
    description: "Warm, rustic, welcoming — great for eggs, produce and gate sales.",
    accent: "#4a6741",
    secondary: "#8b6914",
    heroStyle: "gradient",
    cardRadius: "1rem",
    buttonStyle: "pill",
    fontWeight: "medium",
  },
  market: {
    id: "market",
    label: "Market",
    description: "Fresh field-green — Vendl’s signature look for local food sellers.",
    accent: "#2e7d3f",
    secondary: "#3d8f52",
    heroStyle: "photo",
    cardRadius: "0.875rem",
    buttonStyle: "pill",
    fontWeight: "medium",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "Clean and understated — lets your products do the talking.",
    accent: "#1a1a1a",
    secondary: "#525252",
    heroStyle: "minimal",
    cardRadius: "0.5rem",
    buttonStyle: "rounded",
    fontWeight: "normal",
  },
  modern: {
    id: "modern",
    label: "Modern",
    description: "Bold contrast and crisp layout — bakeries, boxes and prepared food.",
    accent: "#17361f",
    secondary: "#c45c26",
    heroStyle: "photo",
    cardRadius: "1.25rem",
    buttonStyle: "pill",
    fontWeight: "medium",
  },
};

export function isStorefrontThemePreset(
  value: string | null | undefined,
): value is StorefrontThemePreset {
  return value != null && value in STOREFRONT_THEMES;
}
