import type { StudioTemplateId } from "@/lib/studio/types";
import type { WebsiteBusinessContext, WebsiteGenerationIntent } from "./types";

export const LAYOUT_RECIPE_IDS = [
  "shop_first",
  "story_led",
  "local_visit",
  "weekly_drop",
  "browse_catalog",
] as const;

export type LayoutRecipeId = (typeof LAYOUT_RECIPE_IDS)[number];

export type LayoutRecipeOption = {
  id: LayoutRecipeId;
  label: string;
  description: string;
};

/** Shopify-inspired homepage composition recipes (visual theme stays separate). */
export const LAYOUT_RECIPES: LayoutRecipeOption[] = [
  {
    id: "shop_first",
    label: "Shop first",
    description: "Hero → products → categories → story → signup",
  },
  {
    id: "story_led",
    label: "Story led",
    description: "Hero → story → products → reviews → signup",
  },
  {
    id: "local_visit",
    label: "Local visit",
    description: "Hero → stand/hours → products → story → pickup",
  },
  {
    id: "weekly_drop",
    label: "Weekly drop",
    description: "Hero → this week → how it works → products → signup",
  },
  {
    id: "browse_catalog",
    label: "Browse catalog",
    description: "Hero → categories → products → trust → signup",
  },
];

export function isLayoutRecipeId(value: string): value is LayoutRecipeId {
  return (LAYOUT_RECIPE_IDS as readonly string[]).includes(value);
}

export function pickLayoutRecipe(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): LayoutRecipeId {
  const chosen = intent?.layoutRecipe;
  if (chosen && isLayoutRecipeId(chosen)) return chosen;

  const focus = intent?.primaryGoal ?? "";
  if (focus === "preorders" || focus === "menu") return "weekly_drop";
  if (focus === "farm-stand") return "local_visit";
  if (focus === "subscriptions") return "story_led";
  if (ctx.hasFarmStand && ctx.productCount === 0) return "local_visit";
  if (ctx.hasMenus) return "weekly_drop";
  if (ctx.categoryCount >= 3) return "browse_catalog";
  if (ctx.businessMode === "FOOD_BUSINESS") return "story_led";
  return "shop_first";
}

export function heroPresetForRecipe(
  recipe: LayoutRecipeId,
  templateId: StudioTemplateId,
): string {
  if (recipe === "shop_first") {
    return templateId === "farmhouse" ? "produce-split" : "shop-first";
  }
  if (recipe === "story_led") {
    return templateId === "farmhouse" ? "split" : "editorial";
  }
  if (recipe === "local_visit") {
    return "background";
  }
  if (recipe === "weekly_drop") {
    return templateId === "market" ? "current-menu" : "promo";
  }
  return templateId === "market" ? "product-collage" : "minimal";
}

/** Slot order after Hero — recipes rearrange the always-on core + extras. */
export type HomeSlot =
  | "commerce"
  | "categories"
  | "story"
  | "farm_stand"
  | "how_it_works"
  | "trust"
  | "pickup"
  | "signup"
  | "subscriptions";

export function slotsForRecipe(recipe: LayoutRecipeId): HomeSlot[] {
  switch (recipe) {
    case "shop_first":
      return ["commerce", "categories", "story", "trust", "signup"];
    case "story_led":
      return ["story", "commerce", "trust", "pickup", "signup"];
    case "local_visit":
      return ["farm_stand", "commerce", "story", "pickup", "signup"];
    case "weekly_drop":
      return ["commerce", "how_it_works", "categories", "story", "signup"];
    case "browse_catalog":
      return ["categories", "commerce", "trust", "story", "signup"];
  }
}
