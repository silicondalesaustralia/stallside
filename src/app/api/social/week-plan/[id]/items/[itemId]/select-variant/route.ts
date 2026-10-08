import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { selectWeekPlanVariant } from '@/lib/social/weekPlan/weekPlanProduction'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: { variantId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const variantId = body.variantId?.trim()
  if (!variantId) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  const { id: planId, itemId } = await params
  const db = await createServiceClient()

  try {
    const item = await selectWeekPlanVariant(db, auth.businessId, planId, itemId, variantId)
    return NextResponse.json({ item })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Selection failed'
    const status = message.includes('not found') ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
