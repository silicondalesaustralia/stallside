import type { ColourToken, SectionStyle } from "./section-style";

export type ThemePalette = { accent: string; secondary: string };

export function paletteOf(branding: { accentColor: string; secondaryColor: string }): ThemePalette {
  return { accent: branding.accentColor, secondary: branding.secondaryColor };
}

const TOKEN_CSS: Record<ColourToken, string> = {
  accent: "var(--leaf)",
  secondary: "var(--stand-secondary)",
  wash: "var(--wash)",
  panel: "var(--panel)",
  dark: "var(--field)",
  light: "#ffffff",
};

/** Fixed theme colours from globals.css; accent and secondary come from Branding. */
const TOKEN_HEX: Record<Exclude<ColourToken, "accent" | "secondary">, string> = {
  wash: "#f2f6ef",
  panel: "#fbfdf9",
  dark: "#17361f",
  light: "#ffffff",
};

export const COLOUR_LABELS: Record<ColourToken, string> = {
  accent: "Accent",
  secondary: "Secondary",
  wash: "Soft",
  panel: "Paper",
  dark: "Dark",
  light: "White",
};

export function colourCss(value: string): string {
  return value in TOKEN_CSS ? TOKEN_CSS[value as ColourToken] : value;
}

export function colourHex(value: string, palette: ThemePalette): string {
  if (value === "accent") return palette.accent;
  if (value === "secondary") return palette.secondary;
  if (value in TOKEN_HEX) return TOKEN_HEX[value as keyof typeof TOKEN_HEX];
  return value;
}

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 1;
  const n = parseInt(m[1]!, 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Text colour for a section: the seller's choice, or white/dark ink picked for the background. */
export function resolvedTextColour(style: SectionStyle, palette: ThemePalette): string | null {
  if (style.textColour) return style.textColour;
  if (!style.background) return null;
  const bg = colourHex(style.background, palette);
  return contrastRatio(bg, TOKEN_HEX.light) >= contrastRatio(bg, TOKEN_HEX.dark) ? "light" : "dark";
}

/** Below WCAG AA for body text. */
export function hasLowContrast(style: SectionStyle, palette: ThemePalette, pageBackground = "light"): boolean {
  const text = resolvedTextColour(style, palette);
  if (!text) return false;
  const bg = style.background ?? pageBackground;
  return contrastRatio(colourHex(text, palette), colourHex(bg, palette)) < 4.5;
}
