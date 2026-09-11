import { getLookCombo, getPalette } from "@/lib/website/brand-looks";
import type { AISitePlan } from "./types";
import type { StorefrontConfig } from "@/lib/storefront/types";

/** Apply chosen look onto the site plan (template) and theme overrides. */
export function applyLookToPlan(
  plan: AISitePlan,
  lookId: string,
): { plan: AISitePlan; themeOverrides: StorefrontConfig["themeOverrides"] } | null {
  const look = getLookCombo(lookId);
  const palette = look ? getPalette(look.paletteId) : undefined;
  if (!look || !palette) return null;

  return {
    plan: {
      ...plan,
      designSystem: look.designSystem,
      changeSummary:
        `${plan.changeSummary ?? "Draft website created."} Look: ${look.label}.`.trim(),
    },
    themeOverrides: {
      accentColor: palette.accent,
      secondaryColor: palette.secondary,
      paletteId: look.paletteId,
      fontPairId: look.fontPairId,
    },
  };
}
