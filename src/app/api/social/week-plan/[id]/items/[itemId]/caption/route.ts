import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { updateWeekPlanItemCaption } from '@/lib/social/weekPlan/weekPlanProduction'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: { caption?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.caption !== 'string') {
    return NextResponse.json({ error: 'caption is required' }, { status: 400 })
  }

  const { id: planId, itemId } = await params
  const db = await createServiceClient()

  try {
    const item = await updateWeekPlanItemCaption(
      db,
      auth.businessId,
      planId,
      itemId,
      body.caption,
    )
    return NextResponse.json({ item })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Caption update failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
