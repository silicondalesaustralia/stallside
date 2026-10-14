import { z } from "zod";

/** Theme colours a seller can pick; anything else must be a #rrggbb colour. */
export const COLOUR_TOKENS = ["accent", "secondary", "wash", "panel", "dark", "light"] as const;
export type ColourToken = (typeof COLOUR_TOKENS)[number];

export const HEADING_SIZES = ["sm", "md", "lg", "xl"] as const;
export const BODY_SIZES = ["sm", "md", "lg"] as const;
export const HEADING_TAGS = ["h1", "h2", "h3", "h4"] as const;
export type HeadingSize = (typeof HEADING_SIZES)[number];
export type BodySize = (typeof BODY_SIZES)[number];
export type HeadingTag = (typeof HEADING_TAGS)[number];
export const IMAGE_RADII = ["none", "sm", "md", "lg", "xl"] as const;
export type ImageRadius = (typeof IMAGE_RADII)[number];

/** Sections with a main image whose corners can be rounded. */
export const IMAGE_RADIUS_SECTIONS = new Set(["CraftHeroSection", "CraftImageSection", "CraftImageTextSection"]);
/** Sections with a side-by-side (image | text) layout that can be swapped. */
export const SPLIT_SECTIONS = new Set(["CraftHeroSection", "CraftImageTextSection"]);

const HEX = /^#[0-9a-f]{6}$/i;

export function isColourValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ((COLOUR_TOKENS as readonly string[]).includes(value) || HEX.test(value))
  );
}

export const colourValue = z
  .string()
  .refine(isColourValue, "Pick a theme colour or a #rrggbb colour.");

export const sectionStyleSchema = z.object({
  background: colourValue.optional(),
  textColour: colourValue.optional(),
  headingSize: z.enum(HEADING_SIZES).optional(),
  bodySize: z.enum(BODY_SIZES).optional(),
  headingTag: z.enum(HEADING_TAGS).optional(),
  imageRadius: z.enum(IMAGE_RADII).optional(),
  swapSides: z.boolean().optional(),
});

export type SectionStyle = z.infer<typeof sectionStyleSchema>;

/** Reads a saved `style` prop; invalid fields are dropped so a bad value can't break a page. */
export function parseSectionStyle(raw: unknown): SectionStyle {
  if (!raw || typeof raw !== "object") return {};
  const out: SectionStyle = {};
  const obj = raw as Record<string, unknown>;
  if (isColourValue(obj.background)) out.background = obj.background;
  if (isColourValue(obj.textColour)) out.textColour = obj.textColour;
  if ((HEADING_SIZES as readonly unknown[]).includes(obj.headingSize)) {
    out.headingSize = obj.headingSize as HeadingSize;
  }
  if ((BODY_SIZES as readonly unknown[]).includes(obj.bodySize)) out.bodySize = obj.bodySize as BodySize;
  if ((HEADING_TAGS as readonly unknown[]).includes(obj.headingTag)) {
    out.headingTag = obj.headingTag as HeadingTag;
  }
  if ((IMAGE_RADII as readonly unknown[]).includes(obj.imageRadius)) {
    out.imageRadius = obj.imageRadius as ImageRadius;
  }
  if (obj.swapSides === true) out.swapSides = true;
  return out;
}

/** Sections whose main heading is the page title (h1) unless the seller changes it. */
const H1_SECTIONS = new Set(["CraftHeroSection", "CraftProductDetailSection", "CraftMenuDetailSection"]);

export function defaultHeadingTag(craftName: string): HeadingTag {
  return H1_SECTIONS.has(craftName) ? "h1" : "h2";
}
