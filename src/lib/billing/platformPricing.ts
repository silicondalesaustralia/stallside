// KIT SHIM - constants/env only (no StitchedUp pricing table). Only used to
// estimate AI cost in ai_usage_events (USD->AUD rate, token prices).
import {
  BILLING_BUFFER_MULTIPLIER,
  DEFAULT_GPT4O_MINI_INPUT_USD_PER_1M,
  DEFAULT_GPT4O_MINI_OUTPUT_USD_PER_1M,
  DEFAULT_USD_TO_AUD_RATE,
  TRANSCRIPTION_USD_PER_MINUTE,
} from '@/lib/billing/recordingCost'
import { DEFAULT_MONTHLY_RENDER_ALLOWANCE, DEFAULT_RENDER_PRICE_CENTS } from '@/lib/billing/usageDefaults'

export interface PlatformPricingSettings {
  usdToAudRate: number
  billingBufferMultiplier: number
  twilioAuMobileRentUsd: number
  twilioAuLocalRentUsd: number
  transcriptionUsdPerMinute: number
  gpt4oMiniInputUsdPer1M: number
  gpt4oMiniOutputUsdPer1M: number
  renderPack10Aud: number
  renderPack25Aud: number
  renderPack60Aud: number
  renderPriceCents: number
  monthlyRenderAllowanceDefault: number
  monthlyAiCreditAllowanceDefault: number | null
  aiCreditPriceCents: number
  tradiespostIncludedRendersMonthly: number
  source: 'database' | 'fallback'
  updatedAt: string | null
}

function envNumber(raw: string | undefined, fallback: number, min = 0): number {
  const parsed = raw?.trim() ? Number(raw.trim()) : NaN
  return Number.isFinite(parsed) && parsed > min ? parsed : fallback
}

export async function getPlatformPricing(): Promise<PlatformPricingSettings> {
  return {
    usdToAudRate: envNumber(process.env.USD_TO_AUD_RATE, DEFAULT_USD_TO_AUD_RATE),
    billingBufferMultiplier: BILLING_BUFFER_MULTIPLIER,
    twilioAuMobileRentUsd: 0,
    twilioAuLocalRentUsd: 0,
    transcriptionUsdPerMinute: TRANSCRIPTION_USD_PER_MINUTE,
    gpt4oMiniInputUsdPer1M: envNumber(process.env.GPT4O_MINI_INPUT_USD_PER_1M, DEFAULT_GPT4O_MINI_INPUT_USD_PER_1M),
    gpt4oMiniOutputUsdPer1M: envNumber(process.env.GPT4O_MINI_OUTPUT_USD_PER_1M, DEFAULT_GPT4O_MINI_OUTPUT_USD_PER_1M),
    renderPack10Aud: 5,
    renderPack25Aud: 10,
    renderPack60Aud: 20,
    renderPriceCents: DEFAULT_RENDER_PRICE_CENTS,
    monthlyRenderAllowanceDefault: DEFAULT_MONTHLY_RENDER_ALLOWANCE,
    monthlyAiCreditAllowanceDefault: null,
    aiCreditPriceCents: 0,
    tradiespostIncludedRendersMonthly: 10,
    source: 'fallback',
    updatedAt: null,
  }
}

export function invalidatePlatformPricingCache(): void {}
