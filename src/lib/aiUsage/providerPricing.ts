import { resolveUsdToAudRate } from '@/lib/billing/recordingCost'
import { getPlatformPricing } from '@/lib/billing/platformPricing'
import { textractCostUsdForPages } from '@/lib/expenses/textractCost'
import type { AiCostQuality } from './features'

type ImageUsage = {
  input_tokens?: number
  output_tokens?: number
  input_tokens_details?: { image_tokens?: number; text_tokens?: number }
}

export const AI_PRICING_VERSION = 'ai-cogs-v1'

type TokenRates = { inputPer1M: number; outputPer1M: number; cachedPer1M?: number }

/**
 * Only rates we already operate with, or env overrides.
 * Unknown models stay cost-unknown - do not invent list prices.
 */
function tokenRatesFor(provider: string, model: string): TokenRates | null {
  const key = `${provider}:${model}`.toLowerCase()
  const envIn = Number(process.env.AI_COST_INPUT_USD_PER_1M)
  const envOut = Number(process.env.AI_COST_OUTPUT_USD_PER_1M)
  if (Number.isFinite(envIn) && envIn >= 0 && Number.isFinite(envOut) && envOut >= 0) {
    return { inputPer1M: envIn, outputPer1M: envOut }
  }

  if (key.includes('gpt-4o-mini')) {
    const inputPer1M = Number(process.env.GPT4O_MINI_INPUT_USD_PER_1M)
    const outputPer1M = Number(process.env.GPT4O_MINI_OUTPUT_USD_PER_1M)
    return {
      inputPer1M: Number.isFinite(inputPer1M) && inputPer1M >= 0 ? inputPer1M : 0.15,
      outputPer1M: Number.isFinite(outputPer1M) && outputPer1M >= 0 ? outputPer1M : 0.6,
    }
  }

  return null
}

export function estimateLlmCostUsd(input: {
  provider: string
  model: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  cachedInputTokens?: number | null
}): { usd: number; quality: AiCostQuality; pricingVersion: string } | { usd: null; quality: 'unknown'; pricingVersion: string } {
  const model = input.model?.trim() || ''
  const rates = tokenRatesFor(input.provider, model)
  if (!rates) {
    return { usd: null, quality: 'unknown', pricingVersion: `${AI_PRICING_VERSION}:unknown` }
  }
  const inTok = Number(input.inputTokens) || 0
  const outTok = Number(input.outputTokens) || 0
  const cached = Number(input.cachedInputTokens) || 0
  const usd =
    (inTok * rates.inputPer1M +
      outTok * rates.outputPer1M +
      cached * (rates.cachedPer1M ?? rates.inputPer1M)) /
    1_000_000
  return {
    usd: Math.round(usd * 1_000_000) / 1_000_000,
    quality: 'estimated',
    pricingVersion: `${AI_PRICING_VERSION}:${input.provider}:${model || 'unknown'}`,
  }
}

export function estimateImageCostUsd(
  model: string,
  usage: ImageUsage | null,
): { usd: number | null; quality: AiCostQuality; pricingVersion: string } {
  if (!usage) {
    return { usd: null, quality: 'unknown', pricingVersion: `${AI_PRICING_VERSION}:image:unknown` }
  }
  const textIn = usage.input_tokens_details?.text_tokens ?? 0
  const imageIn = usage.input_tokens_details?.image_tokens ?? 0
  const out = usage.output_tokens ?? 0
  const rates = model.startsWith('gpt-image-2')
    ? { textIn: 5, imageIn: 8, out: 30 }
    : { textIn: 5, imageIn: 10, out: 40 }
  const usd = (textIn * rates.textIn + imageIn * rates.imageIn + out * rates.out) / 1_000_000
  if (usd == null) {
    return { usd: null, quality: 'unknown', pricingVersion: `${AI_PRICING_VERSION}:image:unknown` }
  }
  return {
    usd,
    quality: 'estimated',
    pricingVersion: `${AI_PRICING_VERSION}:image:${model}`,
  }
}

export function estimateTextractCostUsd(pages: number): {
  usd: number
  quality: AiCostQuality
  pricingVersion: string
} {
  return {
    usd: textractCostUsdForPages(pages),
    quality: 'estimated',
    pricingVersion: `${AI_PRICING_VERSION}:textract:analyze_expense`,
  }
}

export async function snapshotFxRateUsdToAud(): Promise<number> {
  try {
    const pricing = await getPlatformPricing()
    if (Number.isFinite(pricing.usdToAudRate) && pricing.usdToAudRate > 0) {
      return pricing.usdToAudRate
    }
  } catch {
    // fall through
  }
  return resolveUsdToAudRate()
}

export function applyFxSnapshot(
  usd: number | null,
  fx: number,
): { providerCostAud: number | null; fxRate: number } {
  if (usd == null || !Number.isFinite(usd)) {
    return { providerCostAud: null, fxRate: fx }
  }
  return {
    providerCostAud: Math.round(usd * fx * 10_000) / 10_000,
    fxRate: fx,
  }
}
