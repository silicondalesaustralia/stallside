import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { resetWeekSelections } from '@/lib/social/weekPlan/weekPlanReset'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id: planId } = await params
  const db = await createServiceClient()

  try {
    const result = await resetWeekSelections(db, auth.businessId, planId)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not reset selections'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
