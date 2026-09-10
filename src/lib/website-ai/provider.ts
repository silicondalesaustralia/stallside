import { websiteAiProviderName } from "./config";
import { planSiteHeuristic } from "./heuristic-planner";
import { planSiteWithOpenAI } from "./openai-planner";
import { validateAiSitePlan } from "./validate-plan";
import { compilePlanToStudioPayload } from "./compile-nodes";
import type { SiteGenerationInput, SiteGenerationResult, AISitePlan } from "./types";
import type { StudioPayload } from "@/lib/studio/types";

export type WebsiteAIProvider = {
  createSitePlan(input: SiteGenerationInput): Promise<SiteGenerationResult>;
};

export function getWebsiteAIProvider(): WebsiteAIProvider {
  const name = websiteAiProviderName();
  if (name === "openai") {
    return {
      async createSitePlan(input) {
        const result = await planSiteWithOpenAI(input);
        if (result.ok) return result;
        // Controlled fallback — never leave seller without a draft path.
        const fallback = planSiteHeuristic(input);
        if (fallback.ok) {
          return {
            ...fallback,
            plan: {
              ...fallback.plan,
              changeSummary: `${fallback.plan.changeSummary ?? ""} (OpenAI unavailable: ${result.error})`.trim(),
            },
          };
        }
        return result;
      },
    };
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
    // One repair attempt via heuristic when AI plan fails validation.
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
  };
}
