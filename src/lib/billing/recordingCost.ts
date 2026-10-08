import type { PlatformPricingSettings } from '@/lib/billing/platformPricing'

/** OpenAI gpt-4o-transcribe list price per minute (USD). */
export const TRANSCRIPTION_USD_PER_MINUTE = 0.006

/**
 * Hardcoded USD→AUD for v1 - tiny per-recording amounts; avoids FX API dependency.
 * Override via env when rate drifts (e.g. quarterly manual update).
 */
export const DEFAULT_USD_TO_AUD_RATE = 1.55

/** Pass-through buffer for FX drift + card processing on micro-charges. */
export const BILLING_BUFFER_MULTIPLIER = 1.1

/** Minimum unbilled total before charging (avoids card fees on micro-amounts). */
export const RECORDING_USAGE_MIN_CHARGE_AUD = 1.0

export const RECORDING_USAGE_PRODUCT = 'recording_usage' as const

/** gpt-4o-mini list pricing (USD per 1M tokens) - override via env if OpenAI changes rates. */
export const DEFAULT_GPT4O_MINI_INPUT_USD_PER_1M = 0.15
export const DEFAULT_GPT4O_MINI_OUTPUT_USD_PER_1M = 0.6

export interface SummarizationTokenUsage {
  promptTokens:     number
  completionTokens: number
}

export interface RecordingUsageCostInput {
  durationSeconds:              number
  summarizationTokenUsage?:     SummarizationTokenUsage | null
  /** When provided, overrides env/constant levers (from platform_pricing_settings). */
  pricing?: Pick<
    PlatformPricingSettings,
    | 'usdToAudRate'
    | 'billingBufferMultiplier'
    | 'transcriptionUsdPerMinute'
    | 'gpt4oMiniInputUsdPer1M'
    | 'gpt4oMiniOutputUsdPer1M'
  >
}

export interface RecordingUsageCostResult {
  transcriptionCostUsd:  number
  summarizationCostUsd:  number
  rawCostUsd:            number
  rawCostAud:            number
  billableAud:           number
  usdToAudRate:          number
  billingPeriod:         string
}

export function resolveUsdToAudRate(): number {
  const raw = process.env.USD_TO_AUD_RATE?.trim()
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_USD_TO_AUD_RATE
}

export function resolveBillingBufferMultiplier(): number {
  const raw = process.env.RECORDING_BILLING_BUFFER?.trim()
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : BILLING_BUFFER_MULTIPLIER
}

function resolveGpt4oMiniInputUsdPer1M(): number {
  const raw = process.env.GPT4O_MINI_INPUT_USD_PER_1M?.trim()
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_GPT4O_MINI_INPUT_USD_PER_1M
}

function resolveGpt4oMiniOutputUsdPer1M(): number {
  const raw = process.env.GPT4O_MINI_OUTPUT_USD_PER_1M?.trim()
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_GPT4O_MINI_OUTPUT_USD_PER_1M
}

/** Calendar month in Australia/Sydney as YYYY-MM (for billing_period + display). */
export function currentBillingPeriodSydney(date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Australia/Sydney',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).format(date)
  return formatted.slice(0, 7)
}

export function calculateSummarizationCostUsd(
  usage: SummarizationTokenUsage | null | undefined,
  pricing?: Pick<PlatformPricingSettings, 'gpt4oMiniInputUsdPer1M' | 'gpt4oMiniOutputUsdPer1M'>,
): number {
  if (!usage) return 0
  const inputRate = pricing?.gpt4oMiniInputUsdPer1M ?? resolveGpt4oMiniInputUsdPer1M()
  const outputRate = pricing?.gpt4oMiniOutputUsdPer1M ?? resolveGpt4oMiniOutputUsdPer1M()
  const inputUsd = (usage.promptTokens / 1_000_000) * inputRate
  const outputUsd = (usage.completionTokens / 1_000_000) * outputRate
  return inputUsd + outputUsd
}

export function calculateRecordingUsageCost(
  input: RecordingUsageCostInput,
): RecordingUsageCostResult {
  const durationSeconds = Math.max(0, input.durationSeconds)
  const p = input.pricing
  const transcriptionRate = p?.transcriptionUsdPerMinute ?? TRANSCRIPTION_USD_PER_MINUTE
  const transcriptionCostUsd = (durationSeconds / 60) * transcriptionRate
  const summarizationCostUsd = calculateSummarizationCostUsd(input.summarizationTokenUsage, p)
  const rawCostUsd = transcriptionCostUsd + summarizationCostUsd
  const usdToAudRate = p?.usdToAudRate ?? resolveUsdToAudRate()
  const rawCostAud = rawCostUsd * usdToAudRate
  const buffer = p?.billingBufferMultiplier ?? resolveBillingBufferMultiplier()
  const billableAud = rawCostAud * buffer

  return {
    transcriptionCostUsd,
    summarizationCostUsd,
    rawCostUsd,
    rawCostAud,
    billableAud:   roundAud(billableAud),
    usdToAudRate,
    billingPeriod: currentBillingPeriodSydney(),
  }
}

function roundAud(amount: number): number {
  return Math.round(amount * 10_000) / 10_000
}

export function roundUsd(amount: number): number {
  return Math.round(amount * 1_000_000) / 1_000_000
}
