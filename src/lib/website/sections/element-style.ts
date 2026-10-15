import { colourCss, colourHex, type ThemePalette } from "./colour";

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

export type ElementStyle = {
  colour?: string;
  size?: ElementSize;
  font?: ElementFont;
  weight?: (typeof ELEMENT_WEIGHTS)[number];
  italic?: boolean;
  textCase?: (typeof ELEMENT_CASES)[number];
};
export type ElementStyles = Record<string, ElementStyle>;

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
