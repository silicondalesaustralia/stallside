import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { defaultPlatformsFromBusiness } from '@/lib/social/weekPlan/parseWizardBody'
import { loadActiveWeekPlan } from '@/lib/social/weekPlan/weekPlanService'
import {
  nextWeekMondayDateKey,
  resolveBusinessTimeZone,
} from '@/lib/social/weekPlan/weekIdentity'

export async function GET(req: NextRequest) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const db = await createServiceClient()
  const { data: business, error: bizErr } = await db
    .from('businesses')
    .select(
      'timezone, facebook_page_id, instagram_account_id, gmb_account_id',
    )
    .eq('id', auth.businessId)
    .maybeSingle()

  if (bizErr) {
    return NextResponse.json({ error: bizErr.message }, { status: 500 })
  }

  const timeZone = resolveBusinessTimeZone(business?.timezone)
  const weekStartParam = req.nextUrl.searchParams.get('weekStart')?.trim()
  const weekStartDate = weekStartParam || nextWeekMondayDateKey(timeZone)

  const active = await loadActiveWeekPlan(db, auth.businessId, weekStartDate)

  return NextResponse.json({
    weekStartDate,
    timeZone,
    defaultPlatforms: defaultPlatformsFromBusiness(business ?? {}),
    plan: active?.plan ?? null,
    items: active?.items ?? [],
    itemCount: active?.items.length ?? 0,
  })
}
