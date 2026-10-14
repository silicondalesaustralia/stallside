import { z } from "zod";
import { colourCss, colourHex, type ThemePalette } from "./colour";
import { isColourValue } from "./colour-value";

export const ELEMENT_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
export const ELEMENT_FONTS = ["heading", "body", "sans", "serif", "mono"] as const;
export const ELEMENT_WEIGHTS = ["400", "500", "600", "700", "800"] as const;
export const ELEMENT_CASES = ["normal", "upper"] as const;

export type ElementSize = (typeof ELEMENT_SIZES)[number];
export type ElementFont = (typeof ELEMENT_FONTS)[number];

const SIZE_REM: Record<ElementSize, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "2.5rem",
};

const FONT_FAMILY: Record<ElementFont, string> = {
  heading: "var(--font-display), serif",
  body: "var(--font-body, inherit)",
  sans: "ui-sans-serif, system-ui, sans-serif",
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: "var(--font-mono), ui-monospace, monospace",
};

export const elementStyleSchema = z.object({
  colour: z.string().refine(isColourValue).optional(),
  size: z.enum(ELEMENT_SIZES).optional(),
  font: z.enum(ELEMENT_FONTS).optional(),
  weight: z.enum(ELEMENT_WEIGHTS).optional(),
  italic: z.boolean().optional(),
  textCase: z.enum(ELEMENT_CASES).optional(),
});

export type ElementStyle = z.infer<typeof elementStyleSchema>;
export type ElementStyles = Record<string, ElementStyle>;
type ElementKey = keyof ElementStyle;

const ELEMENT_ID = /^[a-zA-Z][a-zA-Z0-9]{0,31}$/;

/** Reads a section's saved `elements`; bad fields are dropped and empty entries removed. */
export function parseElementStyles(raw: unknown): ElementStyles | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: ElementStyles = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!ELEMENT_ID.test(id) || !value || typeof value !== "object") continue;
    const entry: Record<string, unknown> = {};
    for (const key of Object.keys(elementStyleSchema.shape) as ElementKey[]) {
      const parsed = elementStyleSchema.shape[key].safeParse((value as Record<string, unknown>)[key]);
      if (parsed.success && parsed.data !== undefined) entry[key] = parsed.data;
    }
    if (Object.keys(entry).length) out[id] = entry as ElementStyle;
  }
  return Object.keys(out).length ? out : undefined;
}

export type ElementCss = {
  color?: string;
  fontSize?: string;
  lineHeight?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textTransform?: "uppercase" | "none";
};

/** Inline CSS for one element; theme accent/secondary stay live variables. */
export function elementCss(style: ElementStyle, palette: ThemePalette): ElementCss {
  const css: ElementCss = {};
  if (style.colour) {
    const live = style.colour === "accent" || style.colour === "secondary";
    css.color = live ? colourCss(style.colour) : colourHex(style.colour, palette);
  }
  if (style.size) {
    css.fontSize = SIZE_REM[style.size];
    css.lineHeight = style.size === "2xl" || style.size === "3xl" ? "1.15" : "1.5";
  }
  if (style.font) css.fontFamily = FONT_FAMILY[style.font];
  if (style.weight) css.fontWeight = style.weight;
  if (style.italic) css.fontStyle = "italic";
  if (style.textCase) css.textTransform = style.textCase === "upper" ? "uppercase" : "none";
  return css;
}

export function elementCssMap(styles: ElementStyles | undefined, palette: ThemePalette): Record<string, ElementCss> {
  const out: Record<string, ElementCss> = {};
  for (const [id, style] of Object.entries(styles ?? {})) out[id] = elementCss(style, palette);
  return out;
}
