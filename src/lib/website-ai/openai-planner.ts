import { aiSitePlanSchema } from "./plan-schema";
import { openaiApiKey, websiteAiModel } from "./config";
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

const SYSTEM = `You are Vendl's AI Site Planner. You design websites ONLY as structured JSON matching WebsiteAISpecV1.
Rules:
- Output JSON only. version must be ${WEBSITE_AI_SPEC_VERSION}.
- designSystem must be artisan | farmhouse | market.
- Include exactly one HOME page with 5–10 sections.
- Allowed HOME section types: Hero, ProductGrid, CategoryGrid, NextDrop, FarmStand, ImageText, About, Reviews, Pickup, Signup, Text, Image.
- First section must be Hero. Only one Hero.
- FarmStand only if hasFarmStand. NextDrop only if hasMenus.
- Do NOT invent prices, hours, addresses, certifications, reviews, organic claims, or heritage.
- Prefer factual copy from business context; omit unknown facts.
- Do not generate React, CSS, or HTML.`;

export async function planSiteWithOpenAI(
  input: SiteGenerationInput,
): Promise<SiteGenerationResult> {
  const key = openaiApiKey();
  const model = websiteAiModel();
  if (!key) {
    return { ok: false, error: "OPENAI_API_KEY not configured", provider: "openai" };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Create a Vendl website plan for this business context:\n${JSON.stringify(compactContext(input))}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `OpenAI HTTP ${res.status}: ${text.slice(0, 200)}`,
        provider: "openai",
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, error: "Empty OpenAI response", provider: "openai" };
    }

    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      return { ok: false, error: "OpenAI returned invalid JSON", provider: "openai" };
    }

    const parsed = aiSitePlanSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: `Schema validation failed: ${parsed.error.issues[0]?.message ?? "invalid"}`,
        provider: "openai",
      };
    }

    return {
      ok: true,
      plan: parsed.data as AISitePlan,
      provider: "openai",
      model,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return { ok: false, error: message, provider: "openai" };
  }
}
