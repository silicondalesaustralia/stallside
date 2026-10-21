import { colourHex, resolvedTextColour, type ThemePalette } from "@/lib/website/sections/colour";
import type { SiteStyle } from "./site-style";

/**
 * Theme variables for the header bar (set on the header element itself, so its links,
 * dropdowns and phone menu follow). Empty when the seller kept the template's header colours.
 */
export function siteHeaderVars(style: SiteStyle, palette: ThemePalette): Record<string, string> {
  const vars: Record<string, string> = {};
  if (style.headerBackground) vars["--panel"] = colourHex(style.headerBackground, palette);
  const text =
    style.headerText ??
    (style.headerBackground ? resolvedTextColour({ background: style.headerBackground }, palette) : null);
  if (text) {
    const ink = colourHex(text, palette);
    vars["--field"] = ink;
    vars["--ink"] = ink;
    vars["--muted"] = `color-mix(in srgb, ${ink} 78%, transparent)`;
    vars["--line"] = `color-mix(in srgb, ${ink} 18%, transparent)`;
  }
  if (style.dropdownBackground) vars["--dropdown-bg"] = colourHex(style.dropdownBackground, palette);
  const dropdownInk =
    style.dropdownText ??
    (style.dropdownBackground ? resolvedTextColour({ background: style.dropdownBackground }, palette) : null);
  if (dropdownInk) vars["--dropdown-ink"] = colourHex(dropdownInk, palette);
  if (style.dropdownHoverBackground) vars["--dropdown-hover-bg"] = colourHex(style.dropdownHoverBackground, palette);
  const hoverInk =
    style.dropdownHoverText ??
    (style.dropdownHoverBackground ? resolvedTextColour({ background: style.dropdownHoverBackground }, palette) : null);
  if (hoverInk) vars["--dropdown-hover-ink"] = colourHex(hoverInk, palette);
  return vars;
}
