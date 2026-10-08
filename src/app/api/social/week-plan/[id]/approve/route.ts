import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { logWeekBuilderAnalytics } from '@/lib/social/weekPlan/weekPlanAnalytics'
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

  if (loaded.plan.status === 'plan_approved') {
    return NextResponse.json({ error: 'Plan is already approved' }, { status: 409 })
  }

  if (loaded.plan.status === 'archived') {
    return NextResponse.json({ error: 'Plan is archived' }, { status: 409 })
  }

  if (loaded.items.length === 0) {
    return NextResponse.json({ error: 'Add at least one post before approving' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const plan = await updatePlanStatus(db, id, auth.businessId, 'plan_approved', {
    approved_at: now,
    approved_by_user_id: auth.userId,
  })

  logWeekBuilderAnalytics('week_plan_approved', {
    planId: plan.id,
    postCount: loaded.items.length,
  })

  return NextResponse.json({
    plan,
    items: loaded.items,
    message: 'Your plan is ready. Generate your week when you are ready.',
  })
}
