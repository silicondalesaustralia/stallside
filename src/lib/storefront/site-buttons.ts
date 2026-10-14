import { colourHex, resolvedTextColour, type ThemePalette } from "@/lib/website/sections/colour";

/**
 * One colour for every main button on the site (sections, cart, checkout), stored as theme
 * overrides `buttonColour` / `buttonTextColour`. A section's own button colour still wins.
 * Exposed as `--site-btn-bg` / `--site-btn-ink`; unset = template default (accent + white).
 */
export type SiteButtonColours = { background: string | null; text: string | null };

export function siteButtonColoursOf(branding: {
  buttonColour: string | null;
  buttonTextColour: string | null;
}): SiteButtonColours {
  return { background: branding.buttonColour, text: branding.buttonTextColour };
}

/** CSS variables for the theme root. Hex values so section colour overrides can't shift them. */
export function siteButtonVars(colours: SiteButtonColours, palette: ThemePalette): Record<string, string> {
  const vars: Record<string, string> = {};
  if (colours.background) vars["--site-btn-bg"] = colourHex(colours.background, palette);
  const text =
    colours.text ?? (colours.background ? resolvedTextColour({ background: colours.background }, palette) : null);
  if (text) vars["--site-btn-ink"] = colourHex(text, palette);
  return vars;
}

/** `--site-link` for text links in page content (theme override `linkColour`); unset = template default. */
export function siteLinkVars(linkColour: string | null, palette: ThemePalette): Record<string, string> {
  return linkColour ? { "--site-link": colourHex(linkColour, palette) } : {};
}
