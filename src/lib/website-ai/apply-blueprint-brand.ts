import {
  fontPairIdForBlueprint,
} from "@/lib/website/blueprints/font-pairs";
import {
  getWebsiteBlueprint,
  isWebsiteBlueprintId,
  type WebsiteBlueprintId,
} from "@/lib/website/blueprints";
import { headerStyleFromBlueprint } from "@/lib/storefront/header-style";
import type { StorefrontThemeOverrides } from "@/lib/storefront/types";
import type { AISitePlan } from "./types";

function buttonStyleFromKit(
  style: string,
): StorefrontThemeOverrides["buttonStyle"] {
  if (style === "PILL") return "pill";
  return "rounded";
}

/** Overlay starting-style brand kit colours, fonts, and header onto look theme. */
export function applyBlueprintBrandToTheme(
  overrides: StorefrontThemeOverrides,
  blueprintId: WebsiteBlueprintId,
  options?: { hasLogo?: boolean },
): StorefrontThemeOverrides {
  const bp = getWebsiteBlueprint(blueprintId);
  const kit = bp.brandKit;
  const header = headerStyleFromBlueprint(bp.layout.header, Boolean(options?.hasLogo));
  return {
    ...overrides,
    accentColor: kit.palette.primary,
    secondaryColor: kit.palette.accent,
    paletteId: `style-${blueprintId}`,
    fontPairId: fontPairIdForBlueprint(blueprintId),
    buttonStyle: buttonStyleFromKit(kit.shape.buttonStyle),
    headerLayout: header.headerLayout,
    brandMark: header.brandMark,
  };
}

/** Keep blueprint design system (look may have swapped template). */
export function applyBlueprintDesignSystem(
  plan: AISitePlan,
  blueprintId: string | null | undefined,
): AISitePlan {
  if (!blueprintId || !isWebsiteBlueprintId(blueprintId)) return plan;
  const bp = getWebsiteBlueprint(blueprintId);
  if (plan.designSystem === bp.designSystem) return plan;
  return {
    ...plan,
    designSystem: bp.designSystem,
    changeSummary:
      `${plan.changeSummary ?? ""} Style: ${bp.name}.`.trim(),
  };
}
