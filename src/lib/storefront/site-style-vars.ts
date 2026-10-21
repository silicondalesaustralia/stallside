import { colourCss, colourHex, type ThemePalette } from "@/lib/website/sections/colour";
import { photoVars } from "@/lib/website/sections/photo-style";
import { siteFont } from "./site-fonts";
import type { ContentWidth, SectionSpacing, SiteStyle } from "./site-style";

const WIDTH: Record<ContentWidth, string | null> = { narrow: "60rem", standard: null, wide: "90rem", full: "100%" };
const SPACING: Record<SectionSpacing, [string, string] | null> = {
  compact: ["2.25rem", "1.75rem"],
  standard: null,
  roomy: ["6rem", "3.5rem"],
  spacious: ["8rem", "4.5rem"],
};
const GUTTER = { tight: "0.5", standard: null, wide: "1.75", extra: "2.5" } as const;
const CORNER = { square: "0", soft: "0.375rem", rounded: "0.875rem", round: "1.5rem" } as const;
const BUTTON_RADIUS = { square: "0.125rem", rounded: "0.5rem", pill: "9999px" } as const;
const BUTTON_SIZE = {
  sm: { height: "2.25rem", px: "1rem", font: "0.8125rem" },
  md: { height: "2.75rem", px: "1.375rem", font: "0.9375rem" },
  lg: { height: "3.375rem", px: "2rem", font: "1.0625rem" },
} as const;
const TRACKING = { tight: "-0.03em", normal: "0", wide: "0.06em" } as const;

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
  return { ...vars, ...saleBadgeVars(style, palette) };
}

/** The "Sale" badge next to on-sale prices; CSS reads these so the editor previews changes live. */
function saleBadgeVars(style: SiteStyle, palette: ThemePalette): Record<string, string> {
  const vars: Record<string, string> = {};
  if (style.saleBadge === false) vars["--sale-badge-display"] = "none";
  if (style.saleBadgeText) vars["--sale-badge-text"] = `"${style.saleBadgeText}"`;
  if (style.saleBadgeBackground) vars["--sale-badge-bg"] = ink(style.saleBadgeBackground, palette);
  if (style.saleBadgeColour) vars["--sale-badge-fg"] = ink(style.saleBadgeColour, palette);
  if (style.saleBadgeShape) vars["--sale-badge-radius"] = BUTTON_RADIUS[style.saleBadgeShape];
  return vars;
}

/** Width, spacing, corners, buttons and heading style; applied after the template's own values so they win. */
export function siteLayoutVars(style: SiteStyle): Record<string, string> {
  const vars: Record<string, string> = {};
  const width = style.contentWidth ? WIDTH[style.contentWidth] : null;
  if (width) vars["--studio-content-max"] = width;
  const spacing = style.sectionSpacing ? SPACING[style.sectionSpacing] : null;
  if (spacing) {
    vars["--studio-section-py"] = spacing[0];
    vars["--studio-section-py-mobile"] = spacing[1];
  }
  const gutter = style.sideMargins ? GUTTER[style.sideMargins] : null;
  if (gutter) vars["--gutter-scale"] = gutter;
  if (style.corners) vars["--studio-card-radius"] = CORNER[style.corners];
  if (style.buttonShape) vars["--site-btn-radius"] = BUTTON_RADIUS[style.buttonShape];
  if (style.buttonSize) {
    const size = BUTTON_SIZE[style.buttonSize];
    vars["--studio-btn-height"] = size.height;
    vars["--site-btn-px"] = size.px;
    vars["--site-btn-font"] = size.font;
  }
  if (style.headingWeight) vars["--studio-heading-weight"] = style.headingWeight;
  if (style.headingTracking) vars["--studio-heading-tracking"] = TRACKING[style.headingTracking];
  if (style.headingCase === "upper") vars["--site-heading-case"] = "uppercase";
  return { ...vars, ...photoVars(style) };
}

/** Data attributes for the site root; CSS in website-builder.css reads them. */
export function siteStyleAttrs(style: SiteStyle): Record<string, string> {
  const headingStyled = Boolean(style.headingWeight || style.headingCase || style.headingTracking);
  return {
    ...(style.headingSize ? { "data-site-heading-size": style.headingSize } : {}),
    ...(style.bodySize ? { "data-site-body-size": style.bodySize } : {}),
    ...(headingStyled ? { "data-site-heading-style": "" } : {}),
    ...(style.buttonShape ? { "data-site-btn-shape": style.buttonShape } : {}),
    ...(style.productRatio ? { "data-site-product-ratio": style.productRatio } : {}),
    ...(style.cardHover ? { "data-site-card-hover": style.cardHover } : {}),
    ...(style.animation && style.animation !== "none" ? { "data-site-animate": style.animation } : {}),
    ...(style.dividers && style.dividers !== "none" ? { "data-site-dividers": style.dividers } : {}),
    ...(style.shopSort === false ? { "data-site-shop-sort": "off" } : {}),
    ...(style.shopFilters === false ? { "data-site-shop-filters": "off" } : {}),
    ...(style.shopHidden?.length ? { "data-site-shop-hide": style.shopHidden.join(" ") } : {}),
  };
}

export function siteFontHrefs(style: SiteStyle): string[] {
  return [siteFont(style.headingFont)?.href, siteFont(style.bodyFont)?.href].filter(
    (href, i, all): href is string => Boolean(href) && all.indexOf(href) === i,
  );
}
