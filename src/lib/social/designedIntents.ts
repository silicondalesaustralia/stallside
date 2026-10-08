import type { PostCategoryId } from '@/lib/social/postTaxonomy'

export const DESIGNED_BRIEF_MAX_CHARS = 2000

export type DesignedBriefParse =
  | { ok: true; value: string | null }
  | { ok: false; error: string }

export function countDesignedBriefWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/** Shown in the brief field and generate toast when the 2000-char cap is exceeded. */
export function designedBriefOverLimitMessage(text: string): string | null {
  const length = text.length
  if (length <= DESIGNED_BRIEF_MAX_CHARS) return null
  const over = length - DESIGNED_BRIEF_MAX_CHARS
  const words = countDesignedBriefWords(text)
  const overLabel = over === 1 ? 'character' : 'characters'
  const wordLabel = words === 1 ? 'word' : 'words'
  return `Too long - ${words.toLocaleString('en-AU')} ${wordLabel}, ${over.toLocaleString('en-AU')} ${overLabel} over the ${DESIGNED_BRIEF_MAX_CHARS.toLocaleString('en-AU')} limit. Shorten it to generate.`
}

/** AI Designed brief - 2000 max, no silent truncation. Recreate stays on parseCampaignFocus (800). */
export function parseDesignedBrief(value: unknown): DesignedBriefParse {
  if (value == null) return { ok: true, value: null }
  if (typeof value !== 'string') return { ok: true, value: null }
  const trimmed = value.trim()
  if (!trimmed) return { ok: true, value: null }
  if (trimmed.length > DESIGNED_BRIEF_MAX_CHARS) {
    return {
      ok: false,
      error: designedBriefOverLimitMessage(trimmed) ?? `Instructions must be ${DESIGNED_BRIEF_MAX_CHARS} characters or fewer`,
    }
  }
  return { ok: true, value: trimmed }
}

export const AI_DESIGNED_INTENT_CHIPS = [
  {
    id: 'promote_service',
    label: 'Promote a service',
    starter: 'Promote this service: ',
    categoryId: 'promote_service' as PostCategoryId,
  },
  {
    id: 'completed_job',
    label: 'Completed job',
    starter: 'Show a completed job: ',
    categoryId: 'show_our_work' as PostCategoryId,
  },
  {
    id: 'educational_tips',
    label: 'Educational / tips',
    starter: 'Share a helpful tip about: ',
    categoryId: 'educate_customers' as PostCategoryId,
  },
  {
    id: 'offer_promotion',
    label: 'Offer / promotion',
    starter: 'Promote this offer: ',
    categoryId: 'promotions' as PostCategoryId,
  },
  {
    id: 'trust_proof',
    label: 'Trust / proof',
    starter: 'Build trust by focusing on: ',
    categoryId: 'trust_expertise' as PostCategoryId,
  },
  {
    id: 'seasonal',
    label: 'Seasonal',
    starter: 'Create a seasonal post about: ',
    categoryId: 'seasonal_timely' as PostCategoryId,
  },
  {
    id: 'product_equipment',
    label: 'Product / equipment',
    starter: 'Feature this product or equipment: ',
    categoryId: 'products_equipment' as PostCategoryId,
  },
  {
    id: 'local_community',
    label: 'Local community',
    starter: 'Connect with the local community about: ',
    categoryId: 'local_community' as PostCategoryId,
  },
] as const

export type AiDesignedIntentId = (typeof AI_DESIGNED_INTENT_CHIPS)[number]['id']

const INTENT_IDS = new Set<string>(AI_DESIGNED_INTENT_CHIPS.map((chip) => chip.id))

export function isAiDesignedIntentId(value: unknown): value is AiDesignedIntentId {
  return typeof value === 'string' && INTENT_IDS.has(value)
}

export function aiDesignedIntentById(id: string | null | undefined) {
  if (!id) return null
  return AI_DESIGNED_INTENT_CHIPS.find((chip) => chip.id === id) ?? null
}

export function parseAiDesignedIntentChip(value: unknown): AiDesignedIntentId | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const id = value.trim()
  return isAiDesignedIntentId(id) ? id : null
}

export type DesignedGenerateInputParse =
  | {
      ok: true
      userBrief: string | null
      intentChip: AiDesignedIntentId | null
    }
  | { ok: false; error: string; code: 'invalid_brief' | 'missing_brief_or_chip' }

/**
 * Generate is allowed only when the brief is non-empty OR at least one intent chip is set.
 * Over-limit briefs fail - never silently truncated.
 */
export function parseDesignedGenerateInput(input: {
  userBrief?: unknown
  intentChip?: unknown
}): DesignedGenerateInputParse {
  const parsedBrief = parseDesignedBrief(input.userBrief)
  if (!parsedBrief.ok) {
    return { ok: false, error: parsedBrief.error, code: 'invalid_brief' }
  }
  const intentChip = parseAiDesignedIntentChip(input.intentChip)
  if (!parsedBrief.value && !intentChip) {
    return {
      ok: false,
      error: 'Add a brief or choose at least one focus chip',
      code: 'missing_brief_or_chip',
    }
  }
  return { ok: true, userBrief: parsedBrief.value, intentChip }
}

export function canGenerateDesigned(input: {
  userBrief?: unknown
  intentChip?: unknown
}): boolean {
  return parseDesignedGenerateInput(input).ok
}
