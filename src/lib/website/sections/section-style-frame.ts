import { colourCss, colourHex, resolvedHeadingColour, resolvedTextColour, type ThemePalette } from "./colour";
import type { SectionStyle } from "./section-style";
import { photoVars } from "./photo-style";

export type SectionStyleFrameAttrs = {
  className: string;
  style: Record<string, string>;
  "data-heading-size"?: string;
  "data-body-size"?: string;
  "data-image-radius"?: string;
  "data-swap-sides"?: string;
  "data-button-size"?: string;
  "data-button-text-size"?: string;
  "data-button-font"?: string;
};

/**
 * CSS variables and attributes for a section's wrapper. Overriding the theme's own
 * variables (--wash, --field, --ink, --muted) inside the wrapper recolours the block
 * without each block knowing about section styles.
 */
export function sectionStyleFrame(style: SectionStyle, palette: ThemePalette): SectionStyleFrameAttrs {
  const vars: Record<string, string> = {};
  const classes = ["section-style"];
  if (style.background) {
    const bg = colourCss(style.background);
    vars["--section-bg"] = bg;
    if (style.background !== "wash") vars["--wash"] = bg;
    classes.push("section-style--bg");
  }
  // Hex for fixed tokens so `--field: var(--field)` can't become a cycle.
  const heading = resolvedHeadingColour(style, palette);
  if (heading) vars["--field"] = stableColour(heading, palette);
  if (style.headingColour) classes.push("section-style--heading");
  const text = resolvedTextColour(style, palette);
  if (text) {
    const ink = stableColour(text, palette);
    vars["--section-ink"] = ink;
    vars["--ink"] = ink;
    vars["--muted"] = `color-mix(in srgb, ${ink} 78%, transparent)`;
    vars["--section-muted"] = vars["--muted"];
    classes.push("section-style--ink");
  }
  if (style.cardBackground) {
    const card = stableColour(style.cardBackground, palette);
    vars["--section-card-bg"] = card;
    vars["--panel"] = card;
    classes.push("section-style--card");
  }
  // The seller's own text/heading colours beat the automatic readable-on-card colour.
  const cardInk =
    style.cardTextColour ??
    style.textColour ??
    (style.cardBackground ? resolvedTextColour({ background: style.cardBackground }, palette) : null);
  if (cardInk) {
    const ink = stableColour(cardInk, palette);
    vars["--section-card-ink"] = ink;
    vars["--section-card-heading"] = style.headingColour ? stableColour(style.headingColour, palette) : ink;
    classes.push("section-style--card-ink");
  }
  if (style.buttonColour || style.buttonTextColour) {
    if (style.buttonColour) vars["--section-btn-bg"] = stableColour(style.buttonColour, palette);
    const btnText =
      style.buttonTextColour ??
      (style.buttonColour ? resolvedTextColour({ background: style.buttonColour }, palette) : null);
    if (btnText) vars["--section-btn-ink"] = stableColour(btnText, palette);
    classes.push("section-style--btn");
  }
  return {
    className: classes.join(" "),
    style: { ...vars, ...photoVars(style) },
    ...(style.headingSize ? { "data-heading-size": style.headingSize } : {}),
    ...(style.bodySize ? { "data-body-size": style.bodySize } : {}),
    ...(style.imageRadius ? { "data-image-radius": style.imageRadius } : {}),
    ...(style.swapSides ? { "data-swap-sides": "" } : {}),
    ...(style.buttonSize ? { "data-button-size": style.buttonSize } : {}),
    ...(style.buttonTextSize ? { "data-button-text-size": style.buttonTextSize } : {}),
    ...(style.buttonFont ? { "data-button-font": style.buttonFont } : {}),
  };
}

/** Theme accent/secondary stay live CSS variables; fixed tokens become hex so section ink overrides can't change them. */
function stableColour(value: string, palette: ThemePalette): string {
  return value === "accent" || value === "secondary" ? colourCss(value) : colourHex(value, palette);
}
