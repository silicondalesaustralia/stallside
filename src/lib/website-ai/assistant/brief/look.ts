import { z } from "zod";
import type { ModelSectionType } from "../ai/schemas";

export const LOOK_STYLES = ["auto", "modern", "rustic", "bold"] as const;
export const LOOK_RICHNESS = ["auto", "simple", "balanced", "full"] as const;
export const LOOK_PRODUCT_PAGES = ["auto", "big", "classic", "compact"] as const;
export const LOOK_SECTIONS = ["reviews", "visit", "preorders", "newsletter", "faq"] as const;

export type LookStyle = (typeof LOOK_STYLES)[number];
export type LookRichness = (typeof LOOK_RICHNESS)[number];
export type LookProductPage = (typeof LOOK_PRODUCT_PAGES)[number];
export type LookSection = (typeof LOOK_SECTIONS)[number];

export const lookSchema = z.object({
  style: z.enum(LOOK_STYLES),
  richness: z.enum(LOOK_RICHNESS),
  productPage: z.enum(LOOK_PRODUCT_PAGES),
  /** Null means "let Vendl choose". */
  sections: z.array(z.enum(LOOK_SECTIONS)).max(LOOK_SECTIONS.length).nullable(),
});

export type BriefLook = z.infer<typeof lookSchema>;

export function defaultLook(): BriefLook {
  return { style: "auto", richness: "auto", productPage: "auto", sections: null };
}

/** The homepage section each choice adds. */
export const LOOK_SECTION_TYPES: Record<LookSection, ModelSectionType> = {
  reviews: "reviews",
  visit: "farmStand",
  preorders: "nextDrop",
  newsletter: "signup",
  faq: "faq",
};

/** Only choices this business has the data for. */
export function lookSectionOptions(available: Set<ModelSectionType>): LookSection[] {
  return LOOK_SECTIONS.filter((s) => available.has(LOOK_SECTION_TYPES[s]));
}

/** Wording the starting-style recommender understands. */
export const LOOK_STYLE_HINTS: Record<Exclude<LookStyle, "auto">, string> = {
  modern: "clean modern",
  rustic: "warm rustic local",
  bold: "bold energetic",
};

/** Most homepage sections for each choice; "auto" keeps the usual limit. */
export const LOOK_HOME_MAX: Record<LookRichness, number> = { auto: 8, simple: 4, balanced: 6, full: 9 };

/** Product page layout for each choice; null means decide from the photos. */
export const LOOK_PRODUCT_LAYOUTS: Record<LookProductPage, "featured" | "classic" | "simple" | null> = {
  auto: null,
  big: "featured",
  classic: "classic",
  compact: "simple",
};
