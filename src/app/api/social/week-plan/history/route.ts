import { NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { listWeekPlanHistory } from '@/lib/social/weekPlan/listWeekPlanHistory'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'

export async function GET() {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const db = await createServiceClient()
  const { data: business, error: bizErr } = await db
    .from('businesses')
    .select('timezone')
    .eq('id', auth.businessId)
    .maybeSingle()

  if (bizErr) {
    return NextResponse.json({ error: bizErr.message }, { status: 500 })
  }

  const timeZone = resolveBusinessTimeZone(business?.timezone)
  const history = await listWeekPlanHistory(db, auth.businessId, timeZone)

  return NextResponse.json(history)
}
