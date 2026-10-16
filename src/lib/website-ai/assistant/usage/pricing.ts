import type { AiUsage } from "../ai/result";
import type { ImageApiUsage } from "@/lib/website-ai/image-usage";

export const PRICING_VERSION = "website-ai-v1";

export type CostEstimate = { usdMicros: number | null; quality: "estimated" | "unknown"; version: string };

/** Image rates already used for gpt-image-2 elsewhere in the app (USD per 1M tokens). */
const IMAGE_DEFAULT_RATES: Record<string, { input: number; output: number }> = {
  "gpt-image-2": { input: 5, output: 30 },
};

function rate(name: string): number | null {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function unknown(kind: string): CostEstimate {
  return { usdMicros: null, quality: "unknown", version: `${PRICING_VERSION}:${kind}:unknown` };
}

/**
 * Text model cost from WEBSITE_AI_INPUT/CACHED_INPUT/OUTPUT_USD_PER_1M. Reasoning tokens are
 * already inside output tokens, so they are never charged twice. No price set means unknown.
 */
export function textCost(model: string, usage: AiUsage): CostEstimate {
  const input = rate("WEBSITE_AI_INPUT_USD_PER_1M");
  const output = rate("WEBSITE_AI_OUTPUT_USD_PER_1M");
  if (!usage.known || input === null || output === null) return unknown("text");
  const cachedRate = rate("WEBSITE_AI_CACHED_INPUT_USD_PER_1M") ?? input;
  const cached = Math.min(usage.cachedInputTokens, usage.inputTokens);
  const micros = (usage.inputTokens - cached) * input + cached * cachedRate + usage.outputTokens * output;
  return {
    usdMicros: Math.round(micros),
    quality: "estimated",
    version: `${PRICING_VERSION}:${model}:${input}/${cachedRate}/${output}`,
  };
}

/** Image cost from WEBSITE_AI_IMAGE_INPUT/OUTPUT_USD_PER_1M, else the known default for the model. */
export function imageCost(model: string, usage: ImageApiUsage | null): CostEstimate {
  if (!usage) return unknown("image");
  const fallback = Object.entries(IMAGE_DEFAULT_RATES).find(([prefix]) => model.startsWith(prefix))?.[1];
  const input = rate("WEBSITE_AI_IMAGE_INPUT_USD_PER_1M") ?? fallback?.input ?? null;
  const output = rate("WEBSITE_AI_IMAGE_OUTPUT_USD_PER_1M") ?? fallback?.output ?? null;
  if (input === null || output === null) return unknown("image");
  return {
    usdMicros: Math.round(usage.inputTokens * input + usage.outputTokens * output),
    quality: "estimated",
    version: `${PRICING_VERSION}:${model}:${input}/${output}`,
  };
}
