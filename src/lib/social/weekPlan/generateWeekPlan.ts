import { callLLM } from '@/lib/aiAgent/llmProvider'
import { consumeAiCredits } from '@/lib/billing/consumeAiCredits'
import { createServiceClient } from '@/lib/supabase/server'
import { formatCanonicalTradeLabel, inferCanonicalTrade } from '@/lib/social/canonicalTrades'
import {
  contentMixToPostType,
  resolveTaxonomyForPostType,
  WEEK_PLAN_POST_TYPE_LABELS,
} from '@/lib/social/weekPlan/postTypeMapping'
import {
  validatePlannerItems,
  type ValidatedPlanItem,
} from '@/lib/social/weekPlan/plannerValidation'
import {
  addDaysToDateKey,
  formatWeekPlanDayLabel,
  weekDateRange,
} from '@/lib/social/weekPlan/weekIdentity'
import type {
  WeekPlanContentMix,
  WeekPlanRecentJob,
  WeekPlanWizardAnswers,
} from '@/lib/social/weekPlan/types'
import { logWeekBuilderAnalytics } from '@/lib/social/weekPlan/weekPlanAnalytics'

const PLANNER_MODEL_ENV = 'AI_LLM_MODEL'

export type WeekPlanBusinessContext = {
  name: string | null
  suburb: string | null
  aiAgentServices: string | null
  primaryTradeSlug: string | null
  timezone: string
}

export type GenerateWeekPlanInput = {
  businessId?: string | null
  business: WeekPlanBusinessContext
  weekStartMonday: string
  wizard: WeekPlanWizardAnswers
  recentJobs: WeekPlanRecentJob[]
  allowedJobIds: Set<string>
}

export type GenerateWeekPlanResult =
  | { ok: true; items: ValidatedPlanItem[]; source: 'llm' | 'fallback' }
  | { ok: false; error: string; code: string }

function distributeDates(weekStartMonday: string, count: number, timeZone: string): string[] {
  const week = weekDateRange(weekStartMonday, timeZone)
  if (count === 1) return [week[0]]
  if (count === 2) return [week[0], week[3]]
  if (count === 3) return [week[0], week[2], week[4]]
  if (count === 4) return [week[0], week[2], week[4], week[6]]
  if (count === 5) return [week[0], week[1], week[2], week[4], week[6]]
  if (count === 6) return [week[0], week[1], week[2], week[3], week[4], week[6]]
  return week
}

function defaultMixForChooseForMe(recentJobs: WeekPlanRecentJob[]): WeekPlanContentMix[] {
  const mix: WeekPlanContentMix[] = []
  if (recentJobs.length > 0) mix.push('recent_jobs')
  mix.push('tips_advice', 'services', 'seasonal', 'team_business', 'promotions')
  return mix
}

function pickPostTypes(wizard: WeekPlanWizardAnswers, recentJobs: WeekPlanRecentJob[]): WeekPlanContentMix[] {
  if (wizard.chooseForMe || wizard.contentMix.length === 0) {
    return defaultMixForChooseForMe(recentJobs)
  }
  return wizard.contentMix
}

function buildFallbackItems(input: GenerateWeekPlanInput): ValidatedPlanItem[] {
  const { wizard, weekStartMonday, business, recentJobs } = input
  const count = wizard.postCount
  const dates = distributeDates(weekStartMonday, count, business.timezone)
  const mix = pickPostTypes(wizard, recentJobs)
  const trade =
    inferCanonicalTrade({
      primary_trade_slug: business.primaryTradeSlug,
      ai_agent_services: business.aiAgentServices,
      name: business.name,
    }) ?? null
  const tradeLabel = trade ? formatCanonicalTradeLabel(trade) : 'our services'
  const area = business.suburb?.trim() || 'your area'
  const selectedJobs = recentJobs.filter((j) => wizard.selectedJobIds.includes(j.id))
  let jobIndex = 0

  const items: ValidatedPlanItem[] = []

  for (let i = 0; i < count; i++) {
    const mixKey = mix[i % mix.length]
    const postType = contentMixToPostType(mixKey)
    let topic = ''
    let jobId: string | null = null

    if (postType === 'recent_job') {
      const job = selectedJobs[jobIndex] ?? recentJobs[jobIndex % Math.max(recentJobs.length, 1)]
      jobIndex++
      if (job) {
        jobId = job.id
        topic = job.suburb
          ? `${job.title} in ${job.suburb}`
          : job.title
      } else {
        topic = `Recent ${tradeLabel} work in ${area}`
      }
    } else if (postType === 'tips_advice') {
      topic = `Practical ${tradeLabel.toLowerCase()} tips for homeowners`
    } else if (postType === 'services') {
      topic = `${tradeLabel} - book with ${business.name?.trim() || 'us'}`
    } else if (postType === 'promotions') {
      topic = wizard.priorityText?.trim()
        ? wizard.priorityText.trim().slice(0, 120)
        : `Why choose us for ${tradeLabel.toLowerCase()} in ${area}`
    } else if (postType === 'seasonal') {
      topic = `Seasonal ${tradeLabel.toLowerCase()} reminder for ${area}`
    } else {
      topic = `Meet the team at ${business.name?.trim() || 'our business'}`
    }

    const taxonomy = resolveTaxonomyForPostType(postType)
    items.push({
      targetDate: dates[i],
      postType,
      topic,
      jobId,
      subtypeId: taxonomy.defaultSubtypeId,
      intentChip: taxonomy.intentChip,
      userBrief: wizard.priorityText?.trim()?.slice(0, 500) || null,
    })
  }

  return items
}

function buildPlannerPrompt(input: GenerateWeekPlanInput): { system: string; user: string } {
  const { wizard, weekStartMonday, business, recentJobs } = input
  const weekDates = weekDateRange(weekStartMonday, business.timezone)
  const dateLines = weekDates
    .map((d) => `- ${d} (${formatWeekPlanDayLabel(d, business.timezone)})`)
    .join('\n')

  const mix = pickPostTypes(wizard, recentJobs)
  const postTypesAllowed = [...new Set(mix.map(contentMixToPostType))]

  const jobLines = recentJobs
    .filter((j) => wizard.selectedJobIds.includes(j.id) || wizard.chooseForMe)
    .slice(0, 10)
    .map((j) => `- id=${j.id} title="${j.title}" suburb="${j.suburb}"`)
    .join('\n')

  const system = `You are a social media planner for Australian trade businesses.
Return ONLY a JSON array - no markdown, no commentary.
Each object must have: targetDate (YYYY-MM-DD), postType, topic, and optionally jobId, subtypeId, intentChip, userBrief.

Allowed postType values: recent_job, services, tips_advice, promotions, seasonal, team_business.

Rules:
- Spread posts across the week; avoid stacking on one day.
- Use targetDate values only from the provided week dates.
- Each targetDate may appear once.
- For recent_job, include jobId from the provided job list when relevant.
- Do NOT invent customer names, testimonials, prices, discounts, guarantees, certifications, or rebates.
- Do NOT claim specific job outcomes unless tied to a listed job.
- Topics must be short (under 120 characters), specific, and varied.
- Respect user priority text when provided but do not expand into unsupported claims.
- Create exactly ${wizard.postCount} posts.`

  const trade =
    inferCanonicalTrade({
      primary_trade_slug: business.primaryTradeSlug,
      ai_agent_services: business.aiAgentServices,
      name: business.name,
    }) ?? null
  const tradeLabel = trade ? formatCanonicalTradeLabel(trade) : null

  const user = `Business: ${business.name ?? 'Trade business'}
Primary trade: ${tradeLabel ?? 'General trade services'}
Service area / suburb: ${business.suburb ?? 'Australia'}
Services: ${business.aiAgentServices ?? 'General trade services'}
Target week starts: ${weekStartMonday}

Week dates:
${dateLines}

Post count: ${wizard.postCount}
Allowed post types for this plan: ${postTypesAllowed.join(', ')}
User priority (optional): ${wizard.priorityText?.trim() || '(none)'}

Eligible recent jobs (use id for recent_job posts):
${jobLines || '(none)'}

Return JSON array only.`

  return { system, user }
}

function extractJsonArray(text: string): unknown {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fence ? fence[1].trim() : trimmed
  const start = candidate.indexOf('[')
  const end = candidate.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON array found')
  }
  return JSON.parse(candidate.slice(start, end + 1))
}

export async function generateWeekPlanItems(
  input: GenerateWeekPlanInput,
): Promise<GenerateWeekPlanResult> {
  const validationBase = {
    expectedCount: input.wizard.postCount,
    weekStartMonday: input.weekStartMonday,
    timeZone: input.business.timezone,
    allowedJobIds: input.allowedJobIds,
    requireJobForRecentJob: false,
  }

  if (input.businessId) {
    const weekPlanDb = await createServiceClient()
    await consumeAiCredits(weekPlanDb, {
      businessId: input.businessId,
      feature: 'social_week_plan',
      actionId: `social-week-plan:${input.businessId}:${input.weekStartMonday}`,
      sourceType: 'social_week_plan',
      sourceId: input.weekStartMonday,
    })
  }

  try {
    const { system, user } = buildPlannerPrompt(input)
    const result = await callLLM(system, [{ role: 'user', content: user }], {
      maxTokens: 2000,
      temperature: 0.4,
      usageContext: {
        businessId: input.businessId,
        feature: 'social_week_plan',
        customerCreditsCharged: 0,
      },
    }, PLANNER_MODEL_ENV)

    const raw = extractJsonArray(result.content)
    const validated = validatePlannerItems({ ...validationBase, rawItems: raw })
    if (validated.ok) {
      logWeekBuilderAnalytics('week_plan_llm_success', {
        postCount: input.wizard.postCount,
        provider: result.provider,
      })
      return { ok: true, items: validated.items, source: 'llm' }
    }

    console.warn('[WeekPlan] LLM output failed validation:', validated.code, validated.error)
  } catch (err) {
    console.warn('[WeekPlan] LLM planner failed, using fallback:', err)
  }

  const fallbackItems = buildFallbackItems(input)
  const validated = validatePlannerItems({
    ...validationBase,
    rawItems: fallbackItems.map((item) => ({
      targetDate: item.targetDate,
      postType: item.postType,
      topic: item.topic,
      jobId: item.jobId,
      subtypeId: item.subtypeId,
      intentChip: item.intentChip,
      userBrief: item.userBrief,
    })),
  })

  if (!validated.ok) {
    return { ok: false, error: validated.error, code: validated.code }
  }

  return { ok: true, items: validated.items, source: 'fallback' }
}

export { WEEK_PLAN_POST_TYPE_LABELS, distributeDates }
