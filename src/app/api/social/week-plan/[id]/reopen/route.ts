import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { loadPlanForBusiness, updatePlanStatus } from '@/lib/social/weekPlan/weekPlanService'

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

  if (loaded.plan.status !== 'plan_approved') {
    return NextResponse.json({ error: 'Only approved plans can be reopened' }, { status: 409 })
  }

  if (loaded.plan.generation_status !== 'not_started') {
    return NextResponse.json(
      { error: 'Plan structure is locked during or after generation' },
      { status: 409 },
    )
  }

  const plan = await updatePlanStatus(db, id, auth.businessId, 'draft', {
    approved_at: null,
    approved_by_user_id: null,
  })

  return NextResponse.json({ plan, items: loaded.items })
}
