export const AI_USAGE_FEATURES = [
  'ai_receptionist',
  'missed_call_ai',
  'quote_ai',
  'quote_ai_vision',
  'quote_ai_transcription',
  'social_caption',
  'social_week_plan',
  'social_image',
  'social_recreate',
  'document_expense_scan',
  'document_supplier_bill_scan',
  'document_po_scan',
  'lead_extraction',
  'other',
] as const

export type AiUsageFeature = (typeof AI_USAGE_FEATURES)[number]

export const AI_USAGE_TYPES = [
  'llm_tokens',
  'vision_tokens',
  'image_generation',
  'transcription_seconds',
  'voice_minutes',
  'tts_characters',
  'textract_pages',
  'provider_cost',
] as const

export type AiUsageType = (typeof AI_USAGE_TYPES)[number]

export const AI_USAGE_STATUSES = ['success', 'failed', 'partial', 'cancelled'] as const
export type AiUsageStatus = (typeof AI_USAGE_STATUSES)[number]

export const AI_COST_QUALITIES = ['actual', 'estimated', 'unknown'] as const
export type AiCostQuality = (typeof AI_COST_QUALITIES)[number]

const FEATURE_SET = new Set<string>(AI_USAGE_FEATURES)
const TYPE_SET = new Set<string>(AI_USAGE_TYPES)
const STATUS_SET = new Set<string>(AI_USAGE_STATUSES)

export function normalizeAiUsageFeature(raw: string | null | undefined): AiUsageFeature {
  if (raw && FEATURE_SET.has(raw)) return raw as AiUsageFeature
  return 'other'
}

export function normalizeAiUsageType(raw: string | null | undefined): AiUsageType {
  if (raw && TYPE_SET.has(raw)) return raw as AiUsageType
  return 'llm_tokens'
}

export function normalizeAiUsageStatus(raw: string | null | undefined): AiUsageStatus {
  if (raw && STATUS_SET.has(raw)) return raw as AiUsageStatus
  return 'success'
}

export type AiUsageContext = {
  businessId?: string | null
  userId?: string | null
  feature: AiUsageFeature
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  isTest?: boolean
  customerCreditsCharged?: number | null
  customerAmountAud?: number | null
}
