import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'
import {
  normalizeAiUsageFeature,
  normalizeAiUsageStatus,
  normalizeAiUsageType,
  type AiCostQuality,
  type AiUsageContext,
  type AiUsageFeature,
  type AiUsageStatus,
  type AiUsageType,
} from './features'
import { applyFxSnapshot, snapshotFxRateUsdToAud } from './providerPricing'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const BLOCKED_METADATA_KEYS = [
  'prompt',
  'system_prompt',
  'transcript',
  'content',
  'messages',
  'email',
  'phone',
  'customer_name',
  'visitor_name',
  'generated_text',
  'caption',
]

export type RecordAiUsageEventInput = {
  businessId?: string | null
  userId?: string | null
  feature: AiUsageFeature | string
  provider: string
  model?: string | null
  usageType: AiUsageType | string
  inputTokens?: number | null
  outputTokens?: number | null
  cachedInputTokens?: number | null
  units?: number | null
  unitName?: string | null
  requestId?: string | null
  providerRequestId?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  providerCostUsd?: number | null
  costQuality?: AiCostQuality
  customerCreditsCharged?: number | null
  customerAmountAud?: number | null
  status?: AiUsageStatus | string
  isRefunded?: boolean
  isTest?: boolean
  pricingVersion?: string | null
  errorCode?: string | null
  metadata?: Record<string, unknown>
  fxRateUsdToAud?: number | null
}

export type RecordAiUsageEventResult =
  | { ok: true; skipped?: 'no_business' | 'duplicate' }
  | { ok: false; error: string }

type InsertFn = (row: Record<string, unknown>) => Promise<{ error: { message: string; code?: string } | null }>

let insertOverride: InsertFn | null = null

/** Test-only hook. Never use in production routes. */
export function setAiUsageInsertForTests(fn: InsertFn | null): void {
  insertOverride = fn
}

export function sanitizeAiUsageMetadata(
  raw: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!raw) return {}
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (BLOCKED_METADATA_KEYS.includes(key.toLowerCase())) continue
    if (typeof value === 'string' && value.length > 240) continue
    if (value && typeof value === 'object' && !Array.isArray(value)) continue
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value == null ||
      Array.isArray(value)
    ) {
      out[key] = Array.isArray(value)
        ? value.filter((v) => typeof v === 'string' || typeof v === 'number').slice(0, 20)
        : value
    }
  }
  return out
}

function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_RE.test(value))
}

export async function recordAiUsageEvent(
  input: RecordAiUsageEventInput,
  db?: SupabaseClient,
): Promise<RecordAiUsageEventResult> {
  try {
    if (!isUuid(input.businessId ?? null)) {
      console.warn('[AiUsage] un-attributed business usage', {
        feature: input.feature,
        provider: input.provider,
      })
      return { ok: true, skipped: 'no_business' }
    }

    const fx = input.fxRateUsdToAud && input.fxRateUsdToAud > 0
      ? input.fxRateUsdToAud
      : await snapshotFxRateUsdToAud()
    const quality: AiCostQuality =
      input.costQuality ?? (input.providerCostUsd == null ? 'unknown' : 'estimated')
    const { providerCostAud, fxRate } = applyFxSnapshot(
      input.providerCostUsd ?? null,
      fx,
    )

    const row = {
      business_id: input.businessId,
      user_id: isUuid(input.userId ?? null) ? input.userId : null,
      feature: normalizeAiUsageFeature(input.feature),
      provider: String(input.provider || 'unknown').slice(0, 80),
      model: input.model?.trim() || null,
      usage_type: normalizeAiUsageType(input.usageType),
      input_tokens: input.inputTokens ?? null,
      output_tokens: input.outputTokens ?? null,
      cached_input_tokens: input.cachedInputTokens ?? null,
      units: input.units ?? null,
      unit_name: input.unitName ?? null,
      request_id: input.requestId ?? null,
      provider_request_id: input.providerRequestId ?? null,
      related_entity_type: input.relatedEntityType ?? null,
      related_entity_id: isUuid(input.relatedEntityId ?? null) ? input.relatedEntityId : null,
      provider_cost_usd: input.providerCostUsd ?? null,
      fx_rate_usd_to_aud: fxRate,
      provider_cost_aud: providerCostAud,
      customer_credits_charged: input.customerCreditsCharged ?? null,
      customer_amount_aud: input.customerAmountAud ?? null,
      status: normalizeAiUsageStatus(input.status),
      cost_quality: quality,
      is_refunded: Boolean(input.isRefunded),
      is_test: Boolean(input.isTest),
      pricing_version: input.pricingVersion ?? null,
      error_code: input.errorCode ?? null,
      metadata: sanitizeAiUsageMetadata(input.metadata),
    }

    if (insertOverride) {
      const { error } = await insertOverride(row)
      if (error) throw new Error(error.message)
      return { ok: true }
    }

    const client = db ?? (await createServiceClient())
    const { error } = await client.from('ai_usage_events').insert(row)
    if (error) {
      if (error.code === '23505') {
        return { ok: true, skipped: 'duplicate' }
      }
      console.error('[AiUsage] insert failed', { feature: row.feature, message: error.message })
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[AiUsage] insert failed', { feature: input.feature, message })
    return { ok: false, error: message }
  }
}

export function usageContextToEventFields(ctx: AiUsageContext | undefined): Pick<
  RecordAiUsageEventInput,
  | 'businessId'
  | 'userId'
  | 'feature'
  | 'relatedEntityType'
  | 'relatedEntityId'
  | 'isTest'
  | 'customerCreditsCharged'
  | 'customerAmountAud'
> {
  return {
    businessId: ctx?.businessId,
    userId: ctx?.userId,
    feature: ctx?.feature ?? 'other',
    relatedEntityType: ctx?.relatedEntityType,
    relatedEntityId: ctx?.relatedEntityId,
    isTest: ctx?.isTest,
    customerCreditsCharged: ctx?.customerCreditsCharged,
    customerAmountAud: ctx?.customerAmountAud,
  }
}
