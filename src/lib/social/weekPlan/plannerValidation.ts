import { parseAiDesignedIntentChip } from '@/lib/social/designedIntents'
import { isPostSubtypeId } from '@/lib/social/postTaxonomy'
import {
  isWeekPlanPostType,
  resolveTaxonomyForPostType,
} from '@/lib/social/weekPlan/postTypeMapping'
import { isDateInWeek } from '@/lib/social/weekPlan/weekIdentity'
import type { PlannerRawItem, WeekPlanPlatform, WeekPlanPostType } from '@/lib/social/weekPlan/types'
import {
  WEEK_PLAN_MAX_POSTS,
  WEEK_PLAN_MIN_POSTS,
  WEEK_PLAN_TOPIC_MAX_CHARS,
} from '@/lib/social/weekPlan/types'

export type ValidatedPlanItem = {
  targetDate: string
  postType: WeekPlanPostType
  topic: string
  jobId: string | null
  subtypeId: string | null
  intentChip: string | null
  userBrief: string | null
}

export type ValidatePlannerItemsInput = {
  rawItems: unknown
  expectedCount: number
  weekStartMonday: string
  timeZone: string
  allowedJobIds: Set<string>
  requireJobForRecentJob: boolean
}

export type ValidatePlannerItemsResult =
  | { ok: true; items: ValidatedPlanItem[] }
  | { ok: false; error: string; code: string }

function parseRawItems(raw: unknown): PlannerRawItem[] | null {
  if (!Array.isArray(raw)) return null
  const items: PlannerRawItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') return null
    const r = row as Record<string, unknown>
    if (typeof r.targetDate !== 'string' || typeof r.topic !== 'string') return null
    items.push({
      targetDate: r.targetDate.trim(),
      postType: typeof r.postType === 'string' ? r.postType.trim() : '',
      topic: r.topic.trim(),
      jobId: typeof r.jobId === 'string' ? r.jobId.trim() : null,
      subtypeId: typeof r.subtypeId === 'string' ? r.subtypeId.trim() : null,
      intentChip: typeof r.intentChip === 'string' ? r.intentChip.trim() : null,
      userBrief: typeof r.userBrief === 'string' ? r.userBrief.trim() : null,
    })
  }
  return items
}

export function validatePlannerItems(input: ValidatePlannerItemsInput): ValidatePlannerItemsResult {
  const parsed = parseRawItems(input.rawItems)
  if (!parsed) {
    return { ok: false, error: 'Planner returned invalid JSON shape', code: 'invalid_shape' }
  }

  if (parsed.length !== input.expectedCount) {
    return {
      ok: false,
      error: `Expected ${input.expectedCount} posts, got ${parsed.length}`,
      code: 'wrong_count',
    }
  }

  if (input.expectedCount < WEEK_PLAN_MIN_POSTS || input.expectedCount > WEEK_PLAN_MAX_POSTS) {
    return { ok: false, error: 'Invalid post count', code: 'invalid_count' }
  }

  const seenDates = new Set<string>()
  const validated: ValidatedPlanItem[] = []

  for (const item of parsed) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.targetDate)) {
      return { ok: false, error: 'Invalid target date format', code: 'invalid_date' }
    }
    if (!isDateInWeek(item.targetDate, input.weekStartMonday, input.timeZone)) {
      return {
        ok: false,
        error: `Date ${item.targetDate} is outside the target week`,
        code: 'date_out_of_week',
      }
    }
    if (seenDates.has(item.targetDate)) {
      return {
        ok: false,
        error: 'Duplicate post dates are not allowed',
        code: 'duplicate_date',
      }
    }
    seenDates.add(item.targetDate)

    if (!isWeekPlanPostType(item.postType)) {
      return { ok: false, error: `Unsupported post type: ${item.postType}`, code: 'invalid_post_type' }
    }

    const topic = item.topic.trim()
    if (!topic) {
      return { ok: false, error: 'Each post needs a topic', code: 'empty_topic' }
    }
    if (topic.length > WEEK_PLAN_TOPIC_MAX_CHARS) {
      return { ok: false, error: 'Topic too long', code: 'topic_too_long' }
    }

    let jobId: string | null = item.jobId?.trim() || null
    if (item.postType === 'recent_job') {
      if (!jobId && input.requireJobForRecentJob) {
        return { ok: false, error: 'Recent job posts require a jobId', code: 'missing_job' }
      }
    } else {
      jobId = null
    }

    if (jobId && !input.allowedJobIds.has(jobId)) {
      return { ok: false, error: 'Invalid or ineligible job reference', code: 'invalid_job' }
    }

    if (item.subtypeId && !isPostSubtypeId(item.subtypeId)) {
      return { ok: false, error: 'Invalid subtype ID', code: 'invalid_subtype' }
    }

    if (item.intentChip && !parseAiDesignedIntentChip(item.intentChip)) {
      return { ok: false, error: 'Invalid intent chip', code: 'invalid_intent' }
    }

    const taxonomy = resolveTaxonomyForPostType(item.postType, item.subtypeId)
    validated.push({
      targetDate: item.targetDate,
      postType: item.postType,
      topic,
      jobId,
      subtypeId: item.subtypeId && isPostSubtypeId(item.subtypeId) ? item.subtypeId : taxonomy.subtypeId,
      intentChip: item.intentChip && parseAiDesignedIntentChip(item.intentChip)
        ? item.intentChip
        : taxonomy.intentChip,
      userBrief: item.userBrief?.slice(0, 500) || null,
    })
  }

  return { ok: true, items: validated }
}

export function parseWizardPlatforms(raw: unknown): WeekPlanPlatform[] {
  if (!Array.isArray(raw)) return []
  const out: WeekPlanPlatform[] = []
  for (const p of raw) {
    if (p === 'facebook' || p === 'instagram' || p === 'gmb') {
      if (!out.includes(p)) out.push(p)
    }
  }
  return out
}

export function parseWizardPostCount(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return null
  const count = Math.floor(n)
  if (count < WEEK_PLAN_MIN_POSTS || count > WEEK_PLAN_MAX_POSTS) return null
  return count
}
