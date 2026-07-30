/** Stand accent colour helpers (Tier-1 branding). */

import type { CSSProperties } from "react";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function parseAccentColor(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (!HEX.test(v)) return null;
  return v.toLowerCase();
}

/** Darken a #RRGGBB for --leaf-dark. */
export function darkenHex(hex: string, amount = 0.22): string {
  const n = hex.replace("#", "");
  const r = Math.round(parseInt(n.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(n.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(n.slice(4, 6), 16) * (1 - amount));
  const to = (x: number) => x.toString(16).padStart(2, "0");
  return `#${to(Math.max(0, r))}${to(Math.max(0, g))}${to(Math.max(0, b))}`;
}

export function standAccentStyle(
  accentColor: string | null | undefined,
  secondaryColor?: string | null,
): CSSProperties | undefined {
  const accent = parseAccentColor(accentColor);
  const secondary = parseAccentColor(secondaryColor);
  if (!accent && !secondary) return undefined;

  const style: Record<string, string> = {};
  if (accent) {
    style["--leaf"] = accent;
    style["--leaf-dark"] = darkenHex(accent);
  }
  if (secondary) {
    style["--ok"] = secondary;
    style["--stand-secondary"] = secondary;
  } else if (accent) {
    style["--stand-secondary"] = accent;
  }
  return style as CSSProperties;
}
