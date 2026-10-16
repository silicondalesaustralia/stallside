import { HERO_STYLES, type HeroNeed } from "./hero-styles";
import type { HeroPreset } from "./preset-registry";

/** The facts a hero style depends on; small enough to compute in the editor and the AI builder. */
export type HeroFacts = {
  hasPhoto: boolean;
  productCount: number;
  categoryCount: number;
  hasMenu: boolean;
  hasCountdownMenu: boolean;
  hasHours: boolean;
};

const MESSAGES: Record<HeroNeed, string> = {
  photo: "Add a hero image to use this style.",
  products: "Add products to use this style.",
  categories: "Add at least two categories to use this style.",
  menu: "Add a menu or pre-order drop to use this style.",
  hours: "Add opening hours in your search profile to show open-now status.",
};

function met(need: HeroNeed, style: HeroPreset, f: HeroFacts): boolean {
  switch (need) {
    case "photo":
      return f.hasPhoto;
    case "products":
      return f.productCount > 0;
    case "categories":
      return f.categoryCount >= 2;
    case "menu":
      return style === "countdown" ? f.hasCountdownMenu : f.hasMenu;
    case "hours":
      return f.hasHours;
  }
}

/** What's missing for a style to look finished, or null when it's ready. */
export function missingHeroNeed(style: HeroPreset, facts: HeroFacts): string | null {
  const option = HERO_STYLES.find((s) => s.value === style);
  const need = option?.needs.find((n) => !met(n, style, facts));
  return need ? MESSAGES[need] : null;
}
