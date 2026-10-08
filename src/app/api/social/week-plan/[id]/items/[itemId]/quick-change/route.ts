import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { quickChangeWeekPlanItem } from '@/lib/social/weekPlan/weekPlanProduction'
import { AI_DESIGNED_SET_CREDIT_COST } from '@/lib/social/designedCredits'

export async function GET() {
  return NextResponse.json({
    creditsRequired: AI_DESIGNED_SET_CREDIT_COST,
    previewCount: 3,
    message: 'This will create 3 new designs and use 1 render.',
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: { adjustment?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const adjustment = body.adjustment?.trim()
  if (!adjustment) {
    return NextResponse.json({ error: 'adjustment is required' }, { status: 400 })
  }

  const { id: planId, itemId } = await params
  const db = await createServiceClient()

  try {
    const item = await quickChangeWeekPlanItem(
      db,
      auth.businessId,
      planId,
      itemId,
      adjustment,
    )
    return NextResponse.json({ item })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quick change failed'
    const status = message.includes('credit') ? 402 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
