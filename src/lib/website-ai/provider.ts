import { websiteAiProviderName } from "./config";
import { planSiteHeuristic } from "./heuristic-planner";
import { planSiteWithOpenAI } from "./openai-planner";
import { validateAiSitePlan } from "./validate-plan";
import { compilePlanToStudioPayload } from "./compile-nodes";
import { computeMissingInformation } from "./missing-info";
import { generateDecorativePlaceholders } from "./decorative-images";
import { applyDecorativeImagesToPlan } from "./apply-decorative";
import { applyLookToPlan } from "./apply-look";
import {
  applyBlueprintBrandToTheme,
  applyBlueprintDesignSystem,
} from "./apply-blueprint-brand";
import { materializeKitStarterImages } from "./seed-kit-images";
import { proposeBrandLooks, type BrandLookCombo } from "@/lib/website/brand-looks";
import {
  getDemoKit,
  recommendDemoKit,
  resolveDemoKit,
  type DemoKitId,
} from "@/lib/website/demo-kits";
import { isWebsiteBlueprintId } from "@/lib/website/blueprints";
import type { SiteGenerationInput, SiteGenerationResult, AISitePlan } from "./types";
import type { StudioPayload } from "@/lib/studio/types";
import type { StorefrontThemeOverrides } from "@/lib/storefront/types";

export type WebsiteAIProvider = {
  createSitePlan(input: SiteGenerationInput): Promise<SiteGenerationResult>;
};

function astraOrOpenAIProvider(): WebsiteAIProvider {
  return {
    async createSitePlan(input) {
      const result = await planSiteWithOpenAI(input);
      if (result.ok) return result;
      const fallback = planSiteHeuristic(input);
      if (fallback.ok) {
        return {
          ...fallback,
          plan: {
            ...fallback.plan,
            changeSummary:
              `${fallback.plan.changeSummary ?? ""} (Astra unavailable: ${result.error})`.trim(),
          },
        };
      }
      return result;
    },
  };
}

export function getWebsiteAIProvider(): WebsiteAIProvider {
  const name = websiteAiProviderName();
  if (name === "astra" || name === "openai") {
    return astraOrOpenAIProvider();
  }
  return {
    createSitePlan: async (input) => planSiteHeuristic(input),
  };
}

async function createValidatedPlan(
  input: SiteGenerationInput,
): Promise<
  | { ok: true; plan: AISitePlan; provider: string; model: string }
  | { ok: false; error: string; details?: string[] }
> {
  const provider = getWebsiteAIProvider();
  const result = await provider.createSitePlan(input);
  if (!result.ok) return { ok: false, error: result.error };

  let plan = result.plan;
  const validated = validateAiSitePlan(plan, input.businessContext);
  if (!validated.ok) {
    const repaired = planSiteHeuristic(input);
    if (!repaired.ok) {
      return { ok: false, error: "Plan validation failed", details: validated.errors };
    }
    const recheck = validateAiSitePlan(repaired.plan, input.businessContext);
    if (!recheck.ok) {
      return { ok: false, error: "Plan validation failed", details: recheck.errors };
    }
    plan = recheck.plan;
  } else {
    plan = validated.plan;
  }

  const missing = computeMissingInformation(
    input.businessContext,
    input.intent ?? {},
  ).map((m) => ({
    code: m.id,
    message: m.label,
    blocking: m.severity === "MUST_FIX",
  }));
  plan = { ...plan, missingInformation: missing };

  return { ok: true, plan, provider: result.provider, model: result.model };
}

export type ScaffoldWebsiteResult =
  | {
      ok: true;
      plan: AISitePlan;
      looks: BrandLookCombo[];
      provider: string;
      model: string;
      missing: { code: string; message: string }[];
    }
  | { ok: false; error: string; details?: string[] };

/** Step 1: plan site shape + propose 3 colour palettes (no Craft compile yet). */
export async function scaffoldWebsiteDraft(
  input: SiteGenerationInput,
): Promise<ScaffoldWebsiteResult> {
  const validated = await createValidatedPlan(input);
  if (!validated.ok) return validated;

  const looks = proposeBrandLooks({
    stylePreference: input.intent?.stylePreference,
    businessMode: input.businessContext.businessMode,
    seedAccent: input.businessContext.accentColor,
    seedSecondary: input.businessContext.secondaryColor,
    hasLogo: Boolean(input.businessContext.logoUrl),
  });

  return {
    ok: true,
    plan: validated.plan,
    looks,
    provider: validated.provider,
    model: validated.model,
    missing: (validated.plan.missingInformation ?? []).map((m) => ({
      code: m.code,
      message: m.message,
    })),
  };
}

export type GenerateWebsiteDraftResult =
  | {
      ok: true;
      plan: AISitePlan;
      studio: StudioPayload;
      provider: string;
      model: string;
      missing: { code: string; message: string }[];
      decorativeHeroUrl?: string;
      themeOverrides?: StorefrontThemeOverrides;
      lookId?: string;
    }
  | { ok: false; error: string; details?: string[] };

/** Step 2: apply look + style brand kit, seed kit images, compile to Craft. */
export async function finalizeWebsiteDraft(input: {
  businessContext: SiteGenerationInput["businessContext"];
  intent?: SiteGenerationInput["intent"];
  plan: AISitePlan;
  lookId: string;
  looks?: BrandLookCombo[];
  fontPairId?: string | null;
  demoKitId?: DemoKitId | null;
  provider?: string;
  model?: string;
}): Promise<GenerateWebsiteDraftResult> {
  const applied = applyLookToPlan(
    input.plan,
    input.lookId,
    input.looks,
    input.fontPairId,
  );
  if (!applied) {
    return { ok: false, error: "Unknown look selection." };
  }

  const blueprintId = input.intent?.blueprintId;
  let plan = applyBlueprintDesignSystem(applied.plan, blueprintId);
  let themeOverrides: StorefrontThemeOverrides = applied.themeOverrides ?? {};
  if (blueprintId && isWebsiteBlueprintId(blueprintId)) {
    // Starting style brand kit wins for colours + fonts (look still sets designSystem fallback).
    themeOverrides = applyBlueprintBrandToTheme(themeOverrides, blueprintId, {
      hasLogo: Boolean(input.businessContext.logoUrl),
    });
  }

  let decorativeHeroUrl: string | undefined;
  if (input.intent?.useAiDecorativePlaceholders) {
    const assets = await generateDecorativePlaceholders(input.businessContext);
    if (assets) {
      plan = applyDecorativeImagesToPlan(plan, assets);
      decorativeHeroUrl = assets.heroUrl;
    } else {
      plan = {
        ...plan,
        changeSummary:
          `${plan.changeSummary ?? ""} (Decorative images skipped — image API or blob storage unavailable.)`.trim(),
      };
    }
  } else {
    const kit =
      resolveDemoKit(input.demoKitId) ??
      getDemoKit(
        recommendDemoKit({
          hasFarmStand: input.businessContext.hasFarmStand,
          hasMenus: input.businessContext.hasMenus,
        }),
      );
    const assets = await materializeKitStarterImages(
      kit,
      input.businessContext.ownerId,
    );
    plan = applyDecorativeImagesToPlan(plan, assets);
    decorativeHeroUrl = assets.heroUrl;
    plan = {
      ...plan,
      changeSummary:
        `${plan.changeSummary ?? ""} Kit images: ${kit.id}.`.trim(),
    };
  }

  const compiled = compilePlanToStudioPayload(plan);
  if (!compiled.payload) {
    return {
      ok: false,
      error: "Failed to compile plan to studio nodes",
      details: compiled.errors,
    };
  }

  return {
    ok: true,
    plan,
    studio: compiled.payload,
    provider: input.provider ?? "heuristic",
    model: input.model ?? "local",
    missing: (plan.missingInformation ?? []).map((m) => ({
      code: m.code,
      message: m.message,
    })),
    decorativeHeroUrl,
    themeOverrides,
    lookId: input.lookId,
  };
}

/** One-shot helper (tests / legacy): scaffold then finalize with top look. */
export async function generateWebsiteDraft(
  input: SiteGenerationInput,
): Promise<GenerateWebsiteDraftResult> {
  const scaffold = await scaffoldWebsiteDraft(input);
  if (!scaffold.ok) return scaffold;
  const lookId = scaffold.looks[0]?.id;
  if (!lookId) return { ok: false, error: "No look options available." };
  return finalizeWebsiteDraft({
    businessContext: input.businessContext,
    intent: input.intent,
    plan: scaffold.plan,
    lookId,
    looks: scaffold.looks,
    provider: scaffold.provider,
    model: scaffold.model,
  });
}
