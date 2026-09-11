import type { HeaderPattern } from "@/lib/website/blueprints/layout-types";

export const HEADER_LAYOUTS = ["classic", "centred", "stacked", "minimal"] as const;
export type HeaderLayout = (typeof HEADER_LAYOUTS)[number];

export const BRAND_MARK_MODES = ["logo-and-name", "logo-only", "name-only"] as const;
export type BrandMarkMode = (typeof BRAND_MARK_MODES)[number];

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
      return { headerLayout: "stacked", brandMark: defaults.brandMark };
    case "MINIMAL_ICON":
      return {
        headerLayout: "minimal",
        brandMark: hasLogo ? "logo-only" : "name-only",
      };
    case "CLASSIC":
    case "UTILITY_SEARCH":
    case "INFO_BAR":
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
