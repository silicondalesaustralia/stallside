import { aiSitePlanSchema, formatPlanSchemaError, normalizeAiPlanRaw } from "./plan-schema";
import {
  openaiApiKey,
  openaiApiKeyLooksInvalid,
  websiteAiModel,
  websiteAiProviderName,
  websiteAiReasoningEffort,
} from "./config";
import type { AISitePlan, SiteGenerationInput, SiteGenerationResult } from "./types";
import { WEBSITE_AI_SPEC_VERSION } from "./types";

function compactContext(input: SiteGenerationInput) {
  const c = input.businessContext;
  const intent = input.intent ?? null;
  return {
    businessMode: c.businessMode,
    businessName: c.businessName,
    headline: c.headline,
    subheadline: c.subheadline,
    about: c.about,
    regionLabel: c.regionLabel,
    hasFarmStand: c.hasFarmStand,
    hasMenus: c.hasMenus,
    hasDelivery: c.hasDelivery,
    hasPickup: c.hasPickup,
    productCount: c.productCount,
    categoryCount: c.categoryCount,
    reviewCount: c.reviewCount,
    categories: c.categories.map((x) => x.title),
    featuredProducts: c.featuredProducts.map((x) => x.title),
    selectedPages: intent?.selectedPages ?? null,
    selectedCapabilities: intent?.selectedCapabilities ?? null,
    useAiDecorativePlaceholders: intent?.useAiDecorativePlaceholders ?? false,
    includeSampleProducts: intent?.includeSampleProducts ?? false,
    primaryGoal: intent?.primaryGoal ?? null,
    stylePreference: intent?.stylePreference ?? null,
    sellerNotes: intent?.sellerNotes ?? null,
    sellerAbout: intent?.sellerAbout ?? null,
    contextAnswers: intent?.contextAnswers ?? null,
  };
}

const SYSTEM = `You are Astra, Vendl's AI Site Planner (GPT-6 Astra).
You design websites ONLY as structured JSON matching WebsiteAISpecV1.
Rules:
- Output a single json object only (no markdown). Required keys: version, designSystem, siteStrategy (object with primaryGoal, audienceSummary, contentPriorities), navigation (array), pages (array with at least HOME).
- version must be ${WEBSITE_AI_SPEC_VERSION}.
- designSystem must be artisan | farmhouse | market (internal Vendl systems — never ask the seller to name them).
- siteStrategy must always be an object — never omit it.- Translate feel preferences: warm/local → farmhouse tendency; premium/handcrafted → artisan; bold/energetic → market; clean/modern → artisan or market from business mode.
- Respect selectedPages and selectedCapabilities. Do not invent unpaid commerce capabilities as live.
- Include exactly one HOME page with 5–10 sections. Also include ABOUT/CONTACT/FAQ pages when selected.
- Allowed HOME section types: Hero, ProductGrid, CategoryGrid, NextDrop, FarmStand, ImageText, About, Reviews, Pickup, Signup, Text, Image.
- First section must be Hero. Only one Hero.
- FarmStand only if hasFarmStand. NextDrop only if hasMenus. Otherwise use Text with visibility EDITOR_ONLY and placeholderKind SETUP_STUB.
- For unknown story copy use instructional phrasing ("Tell customers…") with copyKind INSTRUCTIONAL and placeholderKind COPY_INSTRUCTIONAL — never invent heritage/organic/awards.
- Sample products: productPresentation SAMPLE and visibility EDITOR_ONLY only when includeSampleProducts and productCount is 0.
- Do NOT invent prices, hours, addresses, certifications, reviews, organic claims, heritage, or farming practices.
- Prefer factual copy from business context; omit unknown facts.
- Do not generate React, CSS, or HTML.
- Write a short changeSummary for the seller. Do not invent missingInformation — the server computes it.`;

type ResponsesApiJson = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

function extractOutputText(data: ResponsesApiJson): string | null {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (
        (part.type === "output_text" || part.type === "text") &&
        typeof part.text === "string" &&
        part.text.trim()
      ) {
        return part.text;
      }
    }
  }
  return null;
}

function providerLabel(): string {
  const name = websiteAiProviderName();
  if (name === "astra") return "astra";
  return "openai";
}

/** GPT-6 Astra (and OpenAI) site planning via the Responses API. */
export async function planSiteWithOpenAI(
  input: SiteGenerationInput,
): Promise<SiteGenerationResult> {
  const key = openaiApiKey();
  const model = websiteAiModel();
  const provider = providerLabel();
  if (!key) {
    return {
      ok: false,
      error: "OPENAI_API_KEY not configured",
      provider,
    };
  }
  if (openaiApiKeyLooksInvalid(key)) {
    return {
      ok: false,
      error:
        "OPENAI_API_KEY is set to a placeholder (expected a key starting with sk-). Update the Vercel env value, then redeploy the staging alias.",
      provider,
    };
  }

  const effort = websiteAiReasoningEffort();
  // Responses API requires the word "json" in the input when using json_object format.
  const userContent = `Return a json object website plan for this business context:\n${JSON.stringify(compactContext(input))}`;

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: { effort },
        instructions: SYSTEM,
        input: userContent,
        text: { format: { type: "json_object" } },
        max_output_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let detail = text.slice(0, 180);
      try {
        const parsed = JSON.parse(text) as { error?: { code?: string; message?: string } };
        if (parsed.error?.code === "invalid_api_key") {
          detail =
            "invalid API key — confirm Vercel OPENAI_API_KEY starts with sk- and staging was redeployed after changing it";
        } else if (parsed.error?.message) {
          detail = parsed.error.message.slice(0, 180);
        }
      } catch {
        /* keep raw slice */
      }
      return {
        ok: false,
        error: `OpenAI HTTP ${res.status}: ${detail}`,
        provider,
      };
    }

    const data = (await res.json()) as ResponsesApiJson;
    if (data.error?.message) {
      return { ok: false, error: data.error.message, provider };
    }

    const content = extractOutputText(data);
    if (!content) {
      return { ok: false, error: "Empty Astra/OpenAI response", provider };
    }

    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      return { ok: false, error: "Astra returned invalid JSON", provider };
    }

    const parsed = aiSitePlanSchema.safeParse(normalizeAiPlanRaw(raw));
    if (!parsed.success) {
      return {
        ok: false,
        error: `Schema validation failed: ${formatPlanSchemaError(parsed.error)}`,
        provider,
      };
    }

    return {
      ok: true,
      plan: parsed.data as AISitePlan,
      provider,
      model,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return { ok: false, error: message, provider };
  }
}
