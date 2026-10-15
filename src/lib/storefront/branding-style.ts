import type { CSSProperties } from "react";
import { darkenHex } from "@/lib/stand-brand";
import { STOREFRONT_THEMES } from "@/lib/storefront/themes";
import { getFontPair } from "@/lib/website/brand-looks";
import { BRAND_NAME_SIZE_PHONE_MAX } from "@/lib/storefront/header-style";
import { colourCss, paletteOf } from "@/lib/website/sections/colour";
import { siteButtonColoursOf, siteButtonVars, siteLinkVars } from "@/lib/storefront/site-buttons";
import { siteThemeVars } from "@/lib/storefront/site-style-vars";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";

export function storefrontThemeStyle(
  branding: ResolvedStorefrontBranding,
): CSSProperties {
  const fonts = getFontPair(branding.fontPairId);
  const style: Record<string, string> = {
    "--leaf": branding.accentColor,
    "--leaf-dark": darkenHex(branding.accentColor),
    "--ok": branding.secondaryColor,
    "--stand-secondary": branding.secondaryColor,
    "--storefront-radius": STOREFRONT_THEMES[branding.themePreset].cardRadius,
  };
  if (fonts && fonts.id !== "market-default") {
    style["--font-display"] = fonts.displayFamily;
    style["--font-body"] = fonts.bodyFamily;
    style["--font-sans"] = fonts.bodyFamily;
  }
  if (branding.pageBackground) style.backgroundColor = colourCss(branding.pageBackground);
  if (branding.navTextSize) style["--nav-link-size"] = `${branding.navTextSize}px`;
  if (branding.brandNameSize) {
    style["--brand-name-size"] = `${branding.brandNameSize}px`;
    style["--brand-name-size-sm"] = `${Math.min(branding.brandNameSize, BRAND_NAME_SIZE_PHONE_MAX)}px`;
  }
  Object.assign(
    style,
    siteButtonVars(siteButtonColoursOf(branding), paletteOf(branding)),
    siteLinkVars(branding.linkColour, paletteOf(branding)),
    siteThemeVars(branding.siteStyle, paletteOf(branding)),
  );
  return style as CSSProperties;
}

export function storefrontButtonClass(branding: ResolvedStorefrontBranding): string {
  const radius =
    branding.buttonStyle === "rounded"
      ? "rounded-[var(--site-btn-radius,0.75rem)]"
      : "rounded-[var(--site-btn-radius,var(--radius-pill))]";
  return `${radius} bg-[var(--site-btn-bg,var(--leaf))] px-6 py-3 font-semibold text-[var(--site-btn-ink,#fff)] transition hover:brightness-95`;
}
