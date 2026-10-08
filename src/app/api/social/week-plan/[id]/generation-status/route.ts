import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { loadPlanForBusiness } from '@/lib/social/weekPlan/weekPlanService'
import { computeWeekPlanGenerationProgress } from '@/lib/social/weekPlan/weekPlanGenerationProgress'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id: planId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await createServiceClient()
  const { data: userData } = await db.from('users').select('business_id').eq('id', user.id).single()
  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'No business linked to user' }, { status: 400 })
  }

  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const progress = computeWeekPlanGenerationProgress(
    loaded.plan.generation_status,
    loaded.items,
  )

  return NextResponse.json({
    plan: loaded.plan,
    items: loaded.items,
    progress,
  })
}
