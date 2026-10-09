import {
  getLookCombo,
  getPalette,
  getFontPair,
  type BrandLookCombo,
} from "@/lib/website/brand-looks";
import type { AISitePlan } from "./types";
import type { StorefrontConfig } from "@/lib/storefront/types";

/** Apply chosen look onto the site plan (template) and theme overrides. */
export function applyLookToPlan(
  plan: AISitePlan,
  lookId: string,
  looks?: BrandLookCombo[],
  fontPairIdOverride?: string | null,
): { plan: AISitePlan; themeOverrides: StorefrontConfig["themeOverrides"] } | null {
  const look = looks?.find((l) => l.id === lookId) ?? getLookCombo(lookId);
  if (!look) return null;
  const palette = getPalette(look.paletteId);
  const accent = look.accentOverride ?? palette?.accent;
  const secondary = look.secondaryOverride ?? palette?.secondary;
  if (!accent || !secondary) return null;

  const fontPairId =
    fontPairIdOverride && getFontPair(fontPairIdOverride)
      ? fontPairIdOverride
      : look.fontPairId;

  return {
    plan: {
      ...plan,
      designSystem: look.designSystem,
      changeSummary:
        `${plan.changeSummary ?? "Draft website created."} Look: ${look.label}.`.trim(),
    },
    themeOverrides: {
      accentColor: accent,
      secondaryColor: secondary,
      paletteId: look.accentOverride ? "custom" : look.paletteId,
      fontPairId,
    },
  };
}
