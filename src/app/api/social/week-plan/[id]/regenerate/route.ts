import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { generateWeekPlanItems } from '@/lib/social/weekPlan/generateWeekPlan'
import { fetchWeekPlanRecentJobs, validateWeekPlanJobIds } from '@/lib/social/weekPlan/recentJobs'
import { logWeekBuilderAnalytics } from '@/lib/social/weekPlan/weekPlanAnalytics'
import {
  assertPlanEditable,
  loadPlanForBusiness,
  replacePlanItems,
} from '@/lib/social/weekPlan/weekPlanService'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const db = await createServiceClient()
  const loaded = await loadPlanForBusiness(db, auth.businessId, id)

  if (!loaded) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  try {
    assertPlanEditable(loaded.plan)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Plan cannot be edited' },
      { status: 409 },
    )
  }

  const wizard = loaded.plan.wizard_answers
  const { data: business, error: bizErr } = await db
    .from('businesses')
    .select('name, suburb, ai_agent_services, primary_trade_slug, timezone')
    .eq('id', auth.businessId)
    .maybeSingle()

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const timeZone = resolveBusinessTimeZone(business.timezone)
  const recentJobs = await fetchWeekPlanRecentJobs(db, auth.businessId)
  const allowedJobIds = await validateWeekPlanJobIds(
    db,
    auth.businessId,
    [...wizard.selectedJobIds, ...recentJobs.map((j) => j.id)],
  )

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
    weekStartMonday: loaded.plan.week_start_date,
    wizard,
    recentJobs,
    allowedJobIds,
  })

  if (!generated.ok) {
    return NextResponse.json({ error: generated.error, code: generated.code }, { status: 422 })
  }

  const items = await replacePlanItems(db, {
    planId: loaded.plan.id,
    businessId: auth.businessId,
    items: generated.items,
    platforms: wizard.platforms,
  })

  logWeekBuilderAnalytics('week_plan_regenerated', {
    planId: loaded.plan.id,
    postCount: items.length,
    source: generated.source,
  })

  return NextResponse.json({ plan: loaded.plan, items, source: generated.source })
}
