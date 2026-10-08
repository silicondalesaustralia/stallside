import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { moveWeekPlanItemDate } from '@/lib/social/weekPlan/weekPlanReset'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: { targetDate?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const targetDate = body.targetDate?.trim()
  if (!targetDate) {
    return NextResponse.json({ error: 'targetDate is required' }, { status: 400 })
  }

  const { id: planId, itemId } = await params
  const db = await createServiceClient()

  try {
    const item = await moveWeekPlanItemDate(db, auth.businessId, planId, itemId, targetDate)
    return NextResponse.json({ item })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not move post'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
