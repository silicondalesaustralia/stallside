import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { restorePreviousWeekPlanVariants } from '@/lib/social/weekPlan/weekPlanProduction'

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
    const item = await restorePreviousWeekPlanVariants(db, auth.businessId, planId, itemId)
    return NextResponse.json({ item })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Restore failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
