import type { CSSProperties } from "react";
import { parseAccentColor, darkenHex } from "@/lib/stand-brand";
import { STOREFRONT_THEMES, isStorefrontThemePreset } from "@/lib/storefront/themes";
import { getFontPair } from "@/lib/website/brand-looks";
import {
  BRAND_NAME_SIZE_PHONE_MAX,
  LOGO_HEIGHT_DEFAULT,
  clampBrandNameSize,
  clampLogoHeight,
  clampNavTextSize,
  defaultHeaderStyle,
  isBrandMarkMode,
  isHeaderLayout,
} from "@/lib/storefront/header-style";
import { overlayStorefrontIdentity } from "@/lib/storefront/identity";
import { isColourValue } from "@/lib/website/sections/section-style";
import { colourCss, paletteOf } from "@/lib/website/sections/colour";
import { siteButtonColoursOf, siteButtonVars, siteLinkVars } from "@/lib/storefront/site-buttons";
import { parseSiteStyle } from "@/lib/storefront/site-style";
import { siteThemeVars } from "@/lib/storefront/site-style-vars";
import type {
  ResolvedStorefrontBranding,
  StorefrontConfig,
  StorefrontThemePreset,
} from "@/lib/storefront/types";

type OwnerBrandingSource = {
  businessName: string;
  shortDescription: string | null;
  suburb: string | null;
  stateTerritory: string | null;
  contactEmail: string;
  contactPhone: string | null;
  brandAccentColor: string | null;
  brandSecondaryColor: string | null;
  brandLogoUrl: string | null;
};

type StandBrandingSource = {
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
};

type StorefrontBrandingSource = {
  headline: string | null;
  subheadline: string | null;
  about: string | null;
  heroImageUrl: string | null;
  faviconUrl?: string | null;
  themePreset: string;
  contactEmail: string | null;
  showPhone: boolean;
};

export function resolveStorefrontBranding(input: {
  owner: OwnerBrandingSource;
  stand: StandBrandingSource;
  storefront: StorefrontBrandingSource;
  config: StorefrontConfig;
}): ResolvedStorefrontBranding {
  const identity = input.config.identity;
  const storefront = overlayStorefrontIdentity(input.storefront, identity);
  const preset: StorefrontThemePreset = isStorefrontThemePreset(storefront.themePreset)
    ? storefront.themePreset
    : "market";
  const theme = STOREFRONT_THEMES[preset];
  const overrides = input.config.themeOverrides ?? {};

  const accentColor =
    parseAccentColor(overrides.accentColor) ??
    parseAccentColor(input.owner.brandAccentColor) ??
    parseAccentColor(input.stand.accentColor) ??
    theme.accent;

  const secondaryColor =
    parseAccentColor(overrides.secondaryColor) ??
    parseAccentColor(input.owner.brandSecondaryColor) ??
    parseAccentColor(input.stand.secondaryColor) ??
    theme.secondary;

  const regionParts = [input.owner.suburb, input.owner.stateTerritory].filter(
    Boolean,
  );

  const logoUrl =
    identity?.logoUrl !== undefined
      ? identity.logoUrl
      : (input.owner.brandLogoUrl ?? input.stand.logoUrl);
  const headerDefaults = defaultHeaderStyle(Boolean(logoUrl));

  return {
    businessName: input.owner.businessName,
    headline: storefront.headline?.trim() || input.owner.businessName,
    subheadline:
      storefront.subheadline?.trim() ||
      input.owner.shortDescription?.trim() ||
      null,
    about:
      storefront.about?.trim() ||
      input.owner.shortDescription?.trim() ||
      null,
    logoUrl,
    faviconUrl: storefront.faviconUrl ?? null,
    heroImageUrl: storefront.heroImageUrl,
    accentColor,
    secondaryColor,
    buttonStyle: overrides.buttonStyle ?? theme.buttonStyle,
    themePreset: preset,
    paletteId: overrides.paletteId ?? null,
    fontPairId: overrides.fontPairId ?? null,
    headerLayout: isHeaderLayout(overrides.headerLayout)
      ? overrides.headerLayout
      : headerDefaults.headerLayout,
    brandMark: isBrandMarkMode(overrides.brandMark)
      ? overrides.brandMark
      : headerDefaults.brandMark,
    logoHeight: clampLogoHeight(overrides.logoHeight) ?? LOGO_HEIGHT_DEFAULT,
    pageBackground: isColourValue(overrides.pageBackground) ? overrides.pageBackground : null,
    buttonColour: isColourValue(overrides.buttonColour) ? overrides.buttonColour : null,
    buttonTextColour: isColourValue(overrides.buttonTextColour) ? overrides.buttonTextColour : null,
    linkColour: isColourValue(overrides.linkColour) ? overrides.linkColour : null,
    navTextSize: clampNavTextSize(overrides.navTextSize) ?? null,
    brandNameSize: clampBrandNameSize(overrides.brandNameSize) ?? null,
    siteStyle: parseSiteStyle(overrides.siteStyle),
    regionLabel: regionParts.length > 0 ? regionParts.join(", ") : null,
    contactEmail: storefront.contactEmail?.trim() || input.owner.contactEmail,
    contactPhone: storefront.showPhone ? input.owner.contactPhone : null,
    showPhone: storefront.showPhone,
    instagramUrl: input.stand.instagramUrl,
    facebookUrl: input.stand.facebookUrl,
    tiktokUrl: input.stand.tiktokUrl,
    youtubeUrl: input.stand.youtubeUrl,
    websiteUrl: input.stand.websiteUrl,
  };
}

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
