import type { CSSProperties } from "react";
import { parseAccentColor } from "@/lib/stand-brand";

const FALLBACK_ACCENT = "#344A2C";

function hexLuminance(hex: string): number {
  const n = hex.replace("#", "");
  const channel = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function onAccentText(hex: string): string {
  return hexLuminance(hex) > 0.55 ? "#1a1a1a" : "#ffffff";
}

/** Mix accent toward white for selected / soft surfaces. */
function mixWhite(hex: string, whiteRatio: number): string {
  const n = hex.replace("#", "");
  const mix = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16);
    return Math.round(c * (1 - whiteRatio) + 255 * whiteRatio)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${mix(0)}${mix(2)}${mix(4)}`;
}

function resolveAccent(accentColor?: string | null): string {
  return parseAccentColor(accentColor) ?? FALLBACK_ACCENT;
}

/** Listing page tokens: cream surfaces + stand primary for actions. */
export function membershipCategoryBrandStyle(
  accentColor?: string | null,
): CSSProperties {
  const accent = resolveAccent(accentColor);
  return {
    "--mc-bg": "#F7F5EF",
    "--mc-card": "#FFFDF8",
    "--mc-ink": "#292F26",
    "--mc-muted": "#656858",
    "--mc-border": "#DFDFD3",
    "--mc-divider": "#E3E3D9",
    "--mc-label": accent,
    "--mc-action": accent,
    "--mc-action-text": onAccentText(accent),
  } as CSSProperties;
}

/** Offer signup page tokens: same surfaces, stand primary for CTAs. */
export function membershipContentBrandStyle(
  accentColor?: string | null,
): CSSProperties {
  const accent = resolveAccent(accentColor);
  return {
    "--m-bg": "#F7F5EF",
    "--m-card": "#FFFDF8",
    "--m-ink": "#292F26",
    "--m-muted": "#656858",
    "--m-divider": "#DCDCCD",
    "--m-card-border": "#DFDFD3",
    "--m-button": accent,
    "--m-button-text": onAccentText(accent),
    "--m-selected-bg": mixWhite(accent, 0.88),
    "--m-selected-border": accent,
    "--m-upfront-bg": mixWhite(accent, 0.92),
    "--m-input": "#FFFFFF",
    "--m-input-border": "#CDD1C2",
  } as CSSProperties;
}
