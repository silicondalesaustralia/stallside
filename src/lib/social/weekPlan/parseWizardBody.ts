import {
  isWeekPlanContentMix,
} from '@/lib/social/weekPlan/postTypeMapping'
import {
  WEEK_PLAN_CONTENT_MIX,
  WEEK_PLAN_DEFAULT_POSTS,
  WEEK_PLAN_MAX_POSTS,
  WEEK_PLAN_MIN_POSTS,
  WEEK_PLAN_PRIORITY_MAX_CHARS,
  type WeekPlanPlatform,
  type WeekPlanWizardAnswers,
} from '@/lib/social/weekPlan/types'
import { parseWizardPlatforms, parseWizardPostCount } from '@/lib/social/weekPlan/plannerValidation'

export type ParseWizardBodyResult =
  | { ok: true; wizard: WeekPlanWizardAnswers; postCount: number }
  | { ok: false; error: string; status: number }

export function parseWizardBody(body: Record<string, unknown>): ParseWizardBodyResult {
  const postCount = parseWizardPostCount(body.postCount ?? WEEK_PLAN_DEFAULT_POSTS)
  if (postCount === null) {
    return {
      ok: false,
      error: `Post count must be between ${WEEK_PLAN_MIN_POSTS} and ${WEEK_PLAN_MAX_POSTS}`,
      status: 400,
    }
  }

  const chooseForMe = body.chooseForMe === true
  const contentMixRaw = Array.isArray(body.contentMix) ? body.contentMix : []
  const contentMix = contentMixRaw.filter(isWeekPlanContentMix)

  if (!chooseForMe && contentMix.length === 0) {
    return {
      ok: false,
      error: 'Select at least one content type or use Choose for me',
      status: 400,
    }
  }

  let priorityText: string | null = null
  if (typeof body.priorityText === 'string' && body.priorityText.trim()) {
    const trimmed = body.priorityText.trim()
    if (trimmed.length > WEEK_PLAN_PRIORITY_MAX_CHARS) {
      return {
        ok: false,
        error: `Priority text must be ${WEEK_PLAN_PRIORITY_MAX_CHARS} characters or fewer`,
        status: 400,
      }
    }
    priorityText = trimmed
  }

  const selectedJobIds = Array.isArray(body.selectedJobIds)
    ? body.selectedJobIds.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    : []

  const platforms = parseWizardPlatforms(body.platforms)

  const wizard: WeekPlanWizardAnswers = {
    postCount,
    contentMix: chooseForMe ? [...WEEK_PLAN_CONTENT_MIX] : contentMix,
    chooseForMe,
    priorityText,
    selectedJobIds,
    platforms,
  }

  return { ok: true, wizard, postCount }
}

export function defaultPlatformsFromBusiness(business: {
  facebook_page_id?: string | null
  instagram_account_id?: string | null
  gmb_account_id?: string | null
}): WeekPlanPlatform[] {
  const out: WeekPlanPlatform[] = []
  if (business.facebook_page_id?.trim()) out.push('facebook')
  if (business.instagram_account_id?.trim()) out.push('instagram')
  if (business.gmb_account_id?.trim()) out.push('gmb')
  if (out.length === 0) return ['instagram', 'facebook', 'gmb']
  return out
}
