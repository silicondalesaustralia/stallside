import { z } from "zod";
import { isColourValue } from "./colour-value";
import { elementStyleSchema, parseElementStyles } from "./element-style-schema";
import { PHOTO_FITS, PHOTO_FOCI, PHOTO_SHAPES, parsePhotoStyle } from "./photo-style";

export { COLOUR_TOKENS, isColourValue, type ColourToken } from "./colour-value";

export const HEADING_SIZES = ["sm", "md", "lg", "xl"] as const;
export const BODY_SIZES = ["sm", "md", "lg"] as const;
export const HEADING_TAGS = ["h1", "h2", "h3", "h4"] as const;
export type HeadingSize = (typeof HEADING_SIZES)[number];
export type BodySize = (typeof BODY_SIZES)[number];
export type HeadingTag = (typeof HEADING_TAGS)[number];
export const IMAGE_RADII = ["none", "sm", "md", "lg", "xl"] as const;
/** Preset names (older saves) or a pixel value. */
export type ImageRadius = (typeof IMAGE_RADII)[number] | number;
export const IMAGE_RADIUS_MAX = 200;

export const BUTTON_SIZES = ["sm", "md", "lg"] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export const BUTTON_FONTS = ["heading", "body", "sans", "serif"] as const;
export type ButtonFont = (typeof BUTTON_FONTS)[number];

/** Sections with a primary button (`.studio-btn--primary`). */
export const BUTTON_SECTIONS = new Set([
  "CraftHeroSection",
  "CraftImageTextSection",
  "CraftSignupSection",
  "CraftContactFormSection",
  "CraftNextDropSection",
  "CraftFarmStandSection",
  "CraftProductDetailSection",
  "CraftOrderConfirmationSection",
  "CraftPreOrderSection",
  "CraftSubscriptionSection",
  "CraftPreOrderListSection",
  "CraftSubscriptionListSection",
]);
/** Sections with inner cards (`data-section-card` or theme panels) that take their own colours. */
export const CARD_SECTIONS = new Set([
  "CraftOrderConfirmationSection",
  "CraftFarmStandSection",
  "CraftCategoriesSection",
  "CraftPickupSection",
  "CraftNextDropSection",
  "CraftReviewsSection",
  "CraftProductDetailSection",
  "CraftProductGridSection",
  "CraftCategoryDetailSection",
  "CraftCartSection",
  "CraftPreOrderSection",
  "CraftSubscriptionSection",
  "CraftPreOrderListSection",
  "CraftSubscriptionListSection",
]);
/** Sections with a main image whose corners can be rounded. */
export const IMAGE_RADIUS_SECTIONS = new Set(["CraftHeroSection", "CraftImageSection", "CraftImageTextSection"]);
/** Sections with photos whose fit and focus can be set. */
export const PHOTO_SECTIONS = new Set([
  "CraftHeroSection",
  "CraftImageSection",
  "CraftImageTextSection",
  "CraftCategoriesSection",
  "CraftProductGridSection",
  "CraftCategoryDetailSection",
  "CraftFarmStandSection",
  "CraftNextDropSection",
  "CraftPreOrderSection",
  "CraftSubscriptionSection",
  "CraftPreOrderListSection",
  "CraftSubscriptionListSection",
]);
/** Photo sections whose frame shape can be changed too. */
export const PHOTO_SHAPE_SECTIONS = new Set([
  "CraftPreOrderSection",
  "CraftSubscriptionSection",
  "CraftPreOrderListSection",
  "CraftSubscriptionListSection",
]);
/** Sections with a side-by-side (image | text) layout that can be swapped. */
export const SPLIT_SECTIONS = new Set(["CraftHeroSection", "CraftImageTextSection"]);

export const colourValue = z
  .string()
  .refine(isColourValue, "Pick a theme colour or a #rrggbb colour.");

export const sectionStyleSchema = z.object({
  background: colourValue.optional(),
  headingColour: colourValue.optional(),
  textColour: colourValue.optional(),
  cardBackground: colourValue.optional(),
  cardTextColour: colourValue.optional(),
  /** Per-element looks (price, bullet points…) keyed by the ids in `section-elements.ts`. */
  elements: z.record(z.string(), elementStyleSchema).optional(),
  headingSize: z.enum(HEADING_SIZES).optional(),
  bodySize: z.enum(BODY_SIZES).optional(),
  headingTag: z.enum(HEADING_TAGS).optional(),
  imageRadius: z.union([z.enum(IMAGE_RADII), z.number().int().min(0).max(IMAGE_RADIUS_MAX)]).optional(),
  swapSides: z.boolean().optional(),
  buttonSize: z.enum(BUTTON_SIZES).optional(),
  buttonTextSize: z.enum(BUTTON_SIZES).optional(),
  buttonColour: colourValue.optional(),
  buttonTextColour: colourValue.optional(),
  buttonFont: z.enum(BUTTON_FONTS).optional(),
  photoFit: z.enum(PHOTO_FITS).optional(),
  photoFocus: z.enum(PHOTO_FOCI).optional(),
  photoShape: z.enum(PHOTO_SHAPES).optional(),
  photoBackground: colourValue.optional(),
});

export type SectionStyle = z.infer<typeof sectionStyleSchema>;

/** Reads a saved `style` prop; invalid fields are dropped so a bad value can't break a page. */
export function parseSectionStyle(raw: unknown): SectionStyle {
  if (!raw || typeof raw !== "object") return {};
  const out: SectionStyle = {};
  const obj = raw as Record<string, unknown>;
  if (isColourValue(obj.background)) out.background = obj.background;
  if (isColourValue(obj.headingColour)) out.headingColour = obj.headingColour;
  if (isColourValue(obj.textColour)) out.textColour = obj.textColour;
  if (isColourValue(obj.cardBackground)) out.cardBackground = obj.cardBackground;
  if (isColourValue(obj.cardTextColour)) out.cardTextColour = obj.cardTextColour;
  const elements = parseElementStyles(obj.elements);
  if (elements) out.elements = elements;
  if ((HEADING_SIZES as readonly unknown[]).includes(obj.headingSize)) {
    out.headingSize = obj.headingSize as HeadingSize;
  }
  if ((BODY_SIZES as readonly unknown[]).includes(obj.bodySize)) out.bodySize = obj.bodySize as BodySize;
  if ((HEADING_TAGS as readonly unknown[]).includes(obj.headingTag)) {
    out.headingTag = obj.headingTag as HeadingTag;
  }
  const radius = obj.imageRadius;
  if ((IMAGE_RADII as readonly unknown[]).includes(radius)) out.imageRadius = radius as ImageRadius;
  else if (typeof radius === "number" && Number.isInteger(radius) && radius >= 0 && radius <= IMAGE_RADIUS_MAX) out.imageRadius = radius;
  if (obj.swapSides === true) out.swapSides = true;
  const isSize = (v: unknown): v is ButtonSize => (BUTTON_SIZES as readonly unknown[]).includes(v);
  if (isSize(obj.buttonSize)) out.buttonSize = obj.buttonSize;
  if (isSize(obj.buttonTextSize)) out.buttonTextSize = obj.buttonTextSize;
  if (isColourValue(obj.buttonColour)) out.buttonColour = obj.buttonColour;
  if (isColourValue(obj.buttonTextColour)) out.buttonTextColour = obj.buttonTextColour;
  if ((BUTTON_FONTS as readonly unknown[]).includes(obj.buttonFont)) out.buttonFont = obj.buttonFont as ButtonFont;
  return { ...out, ...parsePhotoStyle(obj) };
}

/** Sections whose main heading is the page title (h1) unless the seller changes it. */
const H1_SECTIONS = new Set(["CraftHeroSection", "CraftProductDetailSection", "CraftCategoryDetailSection", "CraftMenuDetailSection"]);

export function defaultHeadingTag(craftName: string): HeadingTag {
  return H1_SECTIONS.has(craftName) ? "h1" : "h2";
}
