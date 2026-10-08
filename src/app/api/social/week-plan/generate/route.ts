import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { generateWeekPlanItems } from '@/lib/social/weekPlan/generateWeekPlan'
import {
  defaultPlatformsFromBusiness,
  parseWizardBody,
} from '@/lib/social/weekPlan/parseWizardBody'
import { fetchWeekPlanRecentJobs, validateWeekPlanJobIds } from '@/lib/social/weekPlan/recentJobs'
import { logWeekBuilderAnalytics } from '@/lib/social/weekPlan/weekPlanAnalytics'
import {
  loadActiveWeekPlan,
  replacePlanItems,
  upsertDraftWeekPlan,
} from '@/lib/social/weekPlan/weekPlanService'
import {
  nextWeekMondayDateKey,
  resolveBusinessTimeZone,
} from '@/lib/social/weekPlan/weekIdentity'
import { normalizeWeekStartMonday } from '@/lib/social/weekPlan/weekPlanWeekSelection'

export async function POST(req: NextRequest) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsedWizard = parseWizardBody(body)
  if (!parsedWizard.ok) {
    return NextResponse.json({ error: parsedWizard.error }, { status: parsedWizard.status })
  }

  const db = await createServiceClient()

  const { data: business, error: bizErr } = await db
    .from('businesses')
    .select(
      'name, suburb, ai_agent_services, primary_trade_slug, timezone, facebook_page_id, instagram_account_id, gmb_account_id',
    )
    .eq('id', auth.businessId)
    .maybeSingle()

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const timeZone = resolveBusinessTimeZone(business.timezone)
  const weekStartDate =
    typeof body.weekStartDate === 'string' && body.weekStartDate.trim()
      ? normalizeWeekStartMonday(body.weekStartDate.trim(), timeZone)
      : nextWeekMondayDateKey(timeZone)

  const existing = await loadActiveWeekPlan(db, auth.businessId, weekStartDate)
  if (existing) {
    return NextResponse.json(
      {
        code: 'existing_week_plan',
        error: 'You already have a plan for this week.',
        existingPlan: {
          id: existing.plan.id,
          status: existing.plan.status,
          week_start_date: existing.plan.week_start_date,
          generation_status: existing.plan.generation_status ?? 'not_started',
        },
      },
      { status: 409 },
    )
  }

  const wizard = parsedWizard.wizard
  if (wizard.platforms.length === 0) {
    wizard.platforms = defaultPlatformsFromBusiness(business)
  }

  const recentJobs = await fetchWeekPlanRecentJobs(db, auth.businessId)
  const allowedJobIds = await validateWeekPlanJobIds(
    db,
    auth.businessId,
    [...wizard.selectedJobIds, ...recentJobs.map((j) => j.id)],
  )

  for (const jobId of wizard.selectedJobIds) {
    if (!allowedJobIds.has(jobId)) {
      return NextResponse.json({ error: 'Invalid job selection' }, { status: 400 })
    }
  }

  const servicesText = Array.isArray(business.ai_agent_services)
    ? business.ai_agent_services.join(', ')
    : typeof business.ai_agent_services === 'string'
      ? business.ai_agent_services
      : null

  const generated = await generateWeekPlanItems({
    businessId: auth.businessId,
    business: {
      name: business.name,
      suburb: business.suburb,
      aiAgentServices: servicesText,
      primaryTradeSlug: business.primary_trade_slug ?? null,
      timezone: timeZone,
    },
    weekStartMonday: weekStartDate,
    wizard,
    recentJobs,
    allowedJobIds,
  })

  if (!generated.ok) {
    return NextResponse.json({ error: generated.error, code: generated.code }, { status: 422 })
  }

  try {
    const plan = await upsertDraftWeekPlan(db, {
      businessId: auth.businessId,
      userId: auth.userId,
      weekStartDate,
      postCountTarget: wizard.postCount,
      wizardAnswers: wizard,
    })

    const items = await replacePlanItems(db, {
      planId: plan.id,
      businessId: auth.businessId,
      items: generated.items,
      platforms: wizard.platforms,
    })

    logWeekBuilderAnalytics('week_plan_created', {
      planId: plan.id,
      postCount: items.length,
      source: generated.source,
      chooseForMe: wizard.chooseForMe,
    })

    return NextResponse.json({ plan, items, source: generated.source })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save plan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
