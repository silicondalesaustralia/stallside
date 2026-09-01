import type { CSSProperties } from "react";
import { parseAccentColor, darkenHex } from "@/lib/stand-brand";
import { STOREFRONT_THEMES, isStorefrontThemePreset } from "@/lib/storefront/themes";
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
  const preset: StorefrontThemePreset = isStorefrontThemePreset(
    input.storefront.themePreset,
  )
    ? input.storefront.themePreset
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

  return {
    businessName: input.owner.businessName,
    headline: input.storefront.headline?.trim() || input.owner.businessName,
    subheadline:
      input.storefront.subheadline?.trim() ||
      input.owner.shortDescription?.trim() ||
      null,
    about:
      input.storefront.about?.trim() ||
      input.owner.shortDescription?.trim() ||
      null,
    logoUrl: input.owner.brandLogoUrl ?? input.stand.logoUrl,
    heroImageUrl: input.storefront.heroImageUrl,
    accentColor,
    secondaryColor,
    buttonStyle: overrides.buttonStyle ?? theme.buttonStyle,
    themePreset: preset,
    regionLabel: regionParts.length > 0 ? regionParts.join(", ") : null,
    contactEmail: input.storefront.contactEmail?.trim() || input.owner.contactEmail,
    contactPhone: input.storefront.showPhone ? input.owner.contactPhone : null,
    showPhone: input.storefront.showPhone,
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
  const style: Record<string, string> = {
    "--leaf": branding.accentColor,
    "--leaf-dark": darkenHex(branding.accentColor),
    "--ok": branding.secondaryColor,
    "--stand-secondary": branding.secondaryColor,
    "--storefront-radius": STOREFRONT_THEMES[branding.themePreset].cardRadius,
  };
  return style as CSSProperties;
}

export function storefrontButtonClass(branding: ResolvedStorefrontBranding): string {
  const radius =
    branding.buttonStyle === "rounded"
      ? "rounded-xl"
      : "rounded-[var(--radius-pill)]";
  return `${radius} bg-[var(--leaf)] px-6 py-3 font-semibold text-white transition hover:brightness-95`;
}
