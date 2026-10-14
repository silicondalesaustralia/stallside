import { z } from "zod";
import { BODY_SIZES, HEADING_SIZES, colourValue } from "@/lib/website/sections/section-style";
import { colourCss, colourHex, type ThemePalette } from "@/lib/website/sections/colour";
import { siteFont } from "./site-fonts";

export const CONTENT_WIDTHS = ["narrow", "standard", "wide", "full"] as const;
export const SECTION_SPACINGS = ["compact", "standard", "roomy", "spacious"] as const;
export type ContentWidth = (typeof CONTENT_WIDTHS)[number];
export type SectionSpacing = (typeof SECTION_SPACINGS)[number];

/**
 * Site-wide look (theme override `siteStyle`). Every field is optional: unset = template default.
 * Sections keep their own colour and size settings, which win over these.
 */
export const siteStyleSchema = z.object({
  headingFont: z.string().max(64).refine((id) => Boolean(siteFont(id)), "Pick a font from the list.").optional(),
  bodyFont: z.string().max(64).refine((id) => Boolean(siteFont(id)), "Pick a font from the list.").optional(),
  headingColour: colourValue.optional(),
  textColour: colourValue.optional(),
  headingSize: z.enum(HEADING_SIZES).optional(),
  bodySize: z.enum(BODY_SIZES).optional(),
  contentWidth: z.enum(CONTENT_WIDTHS).optional(),
  sectionSpacing: z.enum(SECTION_SPACINGS).optional(),
});

export type SiteStyle = z.infer<typeof siteStyleSchema>;
type SiteStyleKey = keyof SiteStyle;

/** Reads a saved `siteStyle`; invalid fields are dropped so a bad value can't break the site. */
export function parseSiteStyle(raw: unknown): SiteStyle {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(siteStyleSchema.shape) as SiteStyleKey[]) {
    const parsed = siteStyleSchema.shape[key].safeParse(obj[key]);
    if (parsed.success && parsed.data !== undefined) out[key] = parsed.data;
  }
  return out as SiteStyle;
}

const WIDTH: Record<ContentWidth, string | null> = { narrow: "60rem", standard: null, wide: "90rem", full: "100%" };
const SPACING: Record<SectionSpacing, [string, string] | null> = {
  compact: ["2.25rem", "1.75rem"],
  standard: null,
  roomy: ["6rem", "3.5rem"],
  spacious: ["8rem", "4.5rem"],
};

function ink(value: string, palette: ThemePalette): string {
  return value === "accent" || value === "secondary" ? colourCss(value) : colourHex(value, palette);
}

/** Fonts and colours; part of the theme style, so cart and checkout pages get them too. */
export function siteThemeVars(style: SiteStyle, palette: ThemePalette): Record<string, string> {
  const vars: Record<string, string> = {};
  const heading = siteFont(style.headingFont);
  const body = siteFont(style.bodyFont);
  if (heading) vars["--font-display"] = heading.family;
  if (body) {
    vars["--font-body"] = body.family;
    vars["--font-sans"] = body.family;
  }
  if (style.headingColour) vars["--field"] = ink(style.headingColour, palette);
  if (style.textColour) {
    const text = ink(style.textColour, palette);
    vars["--ink"] = text;
    vars["--muted"] = `color-mix(in srgb, ${text} 78%, transparent)`;
  }
  return vars;
}

/** Width and spacing; applied after the template's own values so they win. */
export function siteLayoutVars(style: SiteStyle): Record<string, string> {
  const vars: Record<string, string> = {};
  const width = style.contentWidth ? WIDTH[style.contentWidth] : null;
  if (width) vars["--studio-content-max"] = width;
  const spacing = style.sectionSpacing ? SPACING[style.sectionSpacing] : null;
  if (spacing) {
    vars["--studio-section-py"] = spacing[0];
    vars["--studio-section-py-mobile"] = spacing[1];
  }
  return vars;
}

/** Default heading / text size for every section (a section's own size still wins). */
export function siteStyleAttrs(style: SiteStyle): Record<string, string> {
  return {
    ...(style.headingSize ? { "data-site-heading-size": style.headingSize } : {}),
    ...(style.bodySize ? { "data-site-body-size": style.bodySize } : {}),
  };
}

export function siteFontHrefs(style: SiteStyle): string[] {
  return [siteFont(style.headingFont)?.href, siteFont(style.bodyFont)?.href].filter(
    (href, i, all): href is string => Boolean(href) && all.indexOf(href) === i,
  );
}
