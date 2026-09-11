import { websiteAiProviderName } from "./config";
import { planSiteHeuristic } from "./heuristic-planner";
import { planSiteWithOpenAI } from "./openai-planner";
import { validateAiSitePlan } from "./validate-plan";
import { compilePlanToStudioPayload } from "./compile-nodes";
import { computeMissingInformation } from "./missing-info";
import { generateDecorativePlaceholders } from "./decorative-images";
import { applyDecorativeImagesToPlan } from "./apply-decorative";
import type { SiteGenerationInput, SiteGenerationResult, AISitePlan } from "./types";
import type { StudioPayload } from "@/lib/studio/types";

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

export type GenerateWebsiteDraftResult =
  | {
      ok: true;
      plan: AISitePlan;
      studio: StudioPayload;
      provider: string;
      model: string;
      missing: { code: string; message: string }[];
      decorativeHeroUrl?: string;
    }
  | { ok: false; error: string; details?: string[] };

export async function generateWebsiteDraft(
  input: SiteGenerationInput,
): Promise<GenerateWebsiteDraftResult> {
  const provider = getWebsiteAIProvider();
  const result = await provider.createSitePlan(input);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

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

  const compiled = compilePlanToStudioPayload(plan);
  if (compiled.errors.length || !compiled.payload) {
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
    provider: result.provider,
    model: result.model,
    missing: missing.map((m) => ({ code: m.code, message: m.message })),
    decorativeHeroUrl,
  };
}
