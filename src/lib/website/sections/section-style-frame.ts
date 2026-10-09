import { colourCss, colourHex, resolvedTextColour, type ThemePalette } from "./colour";
import type { SectionStyle } from "./section-style";

export type SectionStyleFrameAttrs = {
  className: string;
  style: Record<string, string>;
  "data-heading-size"?: string;
  "data-body-size"?: string;
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
  const text = resolvedTextColour(style, palette);
  if (text) {
    // Hex for fixed tokens so `--field: var(--field)` can't become a cycle.
    const ink =
      text === "accent" || text === "secondary" ? colourCss(text) : colourHex(text, palette);
    vars["--section-ink"] = ink;
    vars["--field"] = ink;
    vars["--ink"] = ink;
    vars["--muted"] = `color-mix(in srgb, ${ink} 78%, transparent)`;
    classes.push("section-style--ink");
  }
  return {
    className: classes.join(" "),
    style: vars,
    ...(style.headingSize ? { "data-heading-size": style.headingSize } : {}),
    ...(style.bodySize ? { "data-body-size": style.bodySize } : {}),
  };
}
