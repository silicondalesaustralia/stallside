import type { HeaderPattern } from "@/lib/website/blueprints/layout-types";

export const HEADER_LAYOUTS = ["classic", "centred", "stacked", "minimal"] as const;
export type HeaderLayout = (typeof HEADER_LAYOUTS)[number];

export const BRAND_MARK_MODES = ["logo-and-name", "logo-only", "name-only"] as const;
export type BrandMarkMode = (typeof BRAND_MARK_MODES)[number];

/** Logo height in the header, in CSS pixels. Phones cap it at LOGO_HEIGHT_MOBILE_MAX. */
export const LOGO_HEIGHT_MIN = 24;
export const LOGO_HEIGHT_MAX = 120;
export const LOGO_HEIGHT_DEFAULT = 36;
export const LOGO_HEIGHT_MOBILE_MAX = 56;

export function clampLogoHeight(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.round(Math.min(LOGO_HEIGHT_MAX, Math.max(LOGO_HEIGHT_MIN, value)));
}

/** Header menu link text size in CSS pixels; unset = template default (14px). */
export const NAV_TEXT_SIZE_MIN = 12;
export const NAV_TEXT_SIZE_MAX = 24;
export const NAV_TEXT_SIZE_DEFAULT = 14;

export function clampNavTextSize(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.round(Math.min(NAV_TEXT_SIZE_MAX, Math.max(NAV_TEXT_SIZE_MIN, value)));
}

/** Header business name text size in CSS pixels; unset = template default (16–18px). Phones cap it at 24px. */
export const BRAND_NAME_SIZE_MIN = 12;
export const BRAND_NAME_SIZE_MAX = 48;
export const BRAND_NAME_SIZE_DEFAULT = 18;
export const BRAND_NAME_SIZE_PHONE_MAX = 24;

export function clampBrandNameSize(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.round(Math.min(BRAND_NAME_SIZE_MAX, Math.max(BRAND_NAME_SIZE_MIN, value)));
}

export function isHeaderLayout(value: unknown): value is HeaderLayout {
  return typeof value === "string" && (HEADER_LAYOUTS as readonly string[]).includes(value);
}

export function isBrandMarkMode(value: unknown): value is BrandMarkMode {
  return typeof value === "string" && (BRAND_MARK_MODES as readonly string[]).includes(value);
}

export function defaultHeaderStyle(hasLogo: boolean): {
  headerLayout: HeaderLayout;
  brandMark: BrandMarkMode;
} {
  return {
    headerLayout: "classic",
    brandMark: hasLogo ? "logo-and-name" : "name-only",
  };
}

/** Map starting-style blueprint header pattern → studio header settings. */
export function headerStyleFromBlueprint(
  pattern: HeaderPattern,
  hasLogo: boolean,
): { headerLayout: HeaderLayout; brandMark: BrandMarkMode } {
  const defaults = defaultHeaderStyle(hasLogo);
  switch (pattern) {
    case "CENTRED":
      return { headerLayout: "centred", brandMark: defaults.brandMark };
    case "STACKED":
    case "INFO_BAR":
      return { headerLayout: "stacked", brandMark: defaults.brandMark };
    case "MINIMAL_ICON":
      return {
        headerLayout: "minimal",
        brandMark: hasLogo ? "logo-only" : "name-only",
      };
    case "CLASSIC":
    case "UTILITY_SEARCH":
    case "BOLD_BAR":
    default:
      return defaults;
  }
}

export const HEADER_LAYOUT_LABELS: Record<HeaderLayout, string> = {
  classic: "Classic",
  centred: "Centred",
  stacked: "Stacked",
  minimal: "Minimal",
};

export const BRAND_MARK_LABELS: Record<BrandMarkMode, string> = {
  "logo-and-name": "Logo and name",
  "logo-only": "Logo only",
  "name-only": "Name only",
};
