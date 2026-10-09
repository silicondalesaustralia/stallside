import type { WebsiteTheme } from "@/lib/website/schema/definition";

export type ThemeLayer = Partial<WebsiteTheme>;

/** 1. Platform safe defaults: always complete. */
export const PLATFORM_THEME_DEFAULTS: WebsiteTheme = {
  skin: "market",
  accentColor: "#2f6b3a",
  secondaryColor: "#c8812a",
  buttonStyle: "pill",
  fontPairId: "market-default",
  headerLayout: "classic",
  brandMark: "logo-and-name",
};

function definedOnly(layer: ThemeLayer | undefined): ThemeLayer {
  if (!layer) return {};
  return Object.fromEntries(
    Object.entries(layer).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as ThemeLayer;
}

/**
 * Deterministic precedence: platform defaults < template defaults < explicit
 * seller choices. Later layers only win for values they actually set.
 */
export function resolveWebsiteTheme(layers: {
  template?: ThemeLayer;
  seller?: ThemeLayer;
}): WebsiteTheme {
  return {
    ...PLATFORM_THEME_DEFAULTS,
    ...definedOnly(layers.template),
    ...definedOnly(layers.seller),
  };
}

/**
 * Applies a recommendation (e.g. from AI) without overriding anything the
 * seller already chose. Returns only the keys that were filled.
 */
export function fillUnsetTheme(seller: ThemeLayer, recommendation: ThemeLayer): ThemeLayer {
  const current = definedOnly(seller);
  const filled: ThemeLayer = {};
  for (const [key, value] of Object.entries(definedOnly(recommendation))) {
    if (!(key in current)) Object.assign(filled, { [key]: value });
  }
  return filled;
}
