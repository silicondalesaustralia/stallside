import type { AiDesignedIntentId } from '@/lib/social/designedIntents'
import { isPostSubtypeId, type PostSubtypeId } from '@/lib/social/postTaxonomy'
import {
  WEEK_PLAN_CONTENT_MIX,
  WEEK_PLAN_POST_TYPES,
  type WeekPlanContentMix,
  type WeekPlanPostType,
} from '@/lib/social/weekPlan/types'

/** Customer-facing labels for plan review cards. */
export const WEEK_PLAN_POST_TYPE_LABELS: Record<WeekPlanPostType, string> = {
  recent_job: 'Recent Job',
  services: 'Service Promotion',
  tips_advice: 'Helpful Tip',
  promotions: 'Promotion',
  seasonal: 'Seasonal',
  team_business: 'Team / Business',
}

export type WeekPlanTaxonomyMapping = {
  postType: WeekPlanPostType
  intentChip: AiDesignedIntentId
  defaultSubtypeId: PostSubtypeId
}

/** Maps wizard/planner post types to existing Social taxonomy + AI Designed intent chips. */
export const WEEK_PLAN_TAXONOMY_MAP: Record<WeekPlanPostType, WeekPlanTaxonomyMapping> = {
  recent_job: {
    postType: 'recent_job',
    intentChip: 'completed_job',
    defaultSubtypeId: 'completed_job',
  },
  services: {
    postType: 'services',
    intentChip: 'promote_service',
    defaultSubtypeId: 'service_spotlight',
  },
  tips_advice: {
    postType: 'tips_advice',
    intentChip: 'educational_tips',
    defaultSubtypeId: 'tips',
  },
  promotions: {
    postType: 'promotions',
    intentChip: 'offer_promotion',
    defaultSubtypeId: 'offer',
  },
  seasonal: {
    postType: 'seasonal',
    intentChip: 'seasonal',
    defaultSubtypeId: 'seasonal_campaign',
  },
  team_business: {
    postType: 'team_business',
    intentChip: 'trust_proof',
    defaultSubtypeId: 'team',
  },
}

export function isWeekPlanPostType(value: unknown): value is WeekPlanPostType {
  return typeof value === 'string' && (WEEK_PLAN_POST_TYPES as readonly string[]).includes(value)
}

export function isWeekPlanContentMix(value: unknown): value is WeekPlanContentMix {
  return typeof value === 'string' && (WEEK_PLAN_CONTENT_MIX as readonly string[]).includes(value)
}

export function contentMixToPostType(mix: WeekPlanContentMix): WeekPlanPostType {
  if (mix === 'recent_jobs') return 'recent_job'
  return mix as WeekPlanPostType
}

export function resolveTaxonomyForPostType(
  postType: WeekPlanPostType,
  subtypeId?: string | null,
): WeekPlanTaxonomyMapping & { subtypeId: PostSubtypeId } {
  const base = WEEK_PLAN_TAXONOMY_MAP[postType]
  const resolvedSubtype =
    subtypeId && isPostSubtypeId(subtypeId) ? subtypeId : base.defaultSubtypeId
  return { ...base, subtypeId: resolvedSubtype }
}
