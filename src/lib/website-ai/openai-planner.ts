import { aiSitePlanSchema } from "./plan-schema";
import {
  openaiApiKey,
  websiteAiModel,
  websiteAiProviderName,
  websiteAiReasoningEffort,
} from "./config";
import type { AISitePlan, SiteGenerationInput, SiteGenerationResult } from "./types";
import { WEBSITE_AI_SPEC_VERSION } from "./types";

function compactContext(input: SiteGenerationInput) {
  const c = input.businessContext;
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
    intent: input.intent ?? null,
  };
}

const SYSTEM = `You are Astra, Vendl's AI Site Planner (GPT-6 Astra).
You design websites ONLY as structured JSON matching WebsiteAISpecV1.
Rules:
- Output JSON only. version must be ${WEBSITE_AI_SPEC_VERSION}.
- designSystem must be artisan | farmhouse | market (internal Vendl systems — never ask the seller to name them).
- Translate feel preferences: warm/local → farmhouse tendency; premium/handcrafted → artisan; bold/energetic → market; clean/modern → artisan or market from business mode.
- Include exactly one HOME page with 5–10 sections.
- Allowed HOME section types: Hero, ProductGrid, CategoryGrid, NextDrop, FarmStand, ImageText, About, Reviews, Pickup, Signup, Text, Image.
- First section must be Hero. Only one Hero.
- FarmStand only if hasFarmStand. NextDrop only if hasMenus.
- Do NOT invent prices, hours, addresses, certifications, reviews, organic claims, heritage, or farming practices.
- Prefer factual copy from business context; omit unknown facts.
- Do not generate React, CSS, or HTML.
- Write a short changeSummary for the seller.`;

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

  const effort = websiteAiReasoningEffort();
  const userContent = `Create a Vendl website plan for this business context:\n${JSON.stringify(compactContext(input))}`;

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
      return {
        ok: false,
        error: `OpenAI HTTP ${res.status}: ${text.slice(0, 280)}`,
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

    const parsed = aiSitePlanSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: `Schema validation failed: ${parsed.error.issues[0]?.message ?? "invalid"}`,
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
