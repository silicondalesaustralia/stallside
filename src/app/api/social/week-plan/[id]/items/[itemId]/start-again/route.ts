import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { startAgainWeekPlanItem } from '@/lib/social/weekPlan/weekPlanReset'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id: planId, itemId } = await params
  const db = await createServiceClient()

  try {
    const item = await startAgainWeekPlanItem(db, auth.businessId, planId, itemId)
    return NextResponse.json({ item })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not start again'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
