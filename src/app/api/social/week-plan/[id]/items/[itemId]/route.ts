import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { isWeekPlanPostType, resolveTaxonomyForPostType } from '@/lib/social/weekPlan/postTypeMapping'
import { validateWeekPlanJobIds } from '@/lib/social/weekPlan/recentJobs'
import { isDateInWeek, resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import {
  assertPlanEditable,
  loadPlanForBusiness,
  serializeItemRow,
} from '@/lib/social/weekPlan/weekPlanService'
import { WEEK_PLAN_TOPIC_MAX_CHARS } from '@/lib/social/weekPlan/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id, itemId } = await params
  const db = await createServiceClient()
  const loaded = await loadPlanForBusiness(db, auth.businessId, id)

  if (!loaded) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  try {
    assertPlanEditable(loaded.plan)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Plan cannot be edited' },
      { status: 409 },
    )
  }

  const item = loaded.items.find((i) => i.id === itemId)
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}

  if (typeof body.topic === 'string') {
    const topic = body.topic.trim()
    if (!topic || topic.length > WEEK_PLAN_TOPIC_MAX_CHARS) {
      return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })
    }
    patch.topic = topic
  }

  if (typeof body.postType === 'string' && isWeekPlanPostType(body.postType.trim())) {
    const postType = body.postType.trim() as import('@/lib/social/weekPlan/types').WeekPlanPostType
    const taxonomy = resolveTaxonomyForPostType(postType)
    patch.post_type = postType
    patch.subtype_id = taxonomy.subtypeId
    patch.intent_chip = taxonomy.intentChip
    if (postType !== 'recent_job') {
      patch.job_id = null
    }
  }

  if (typeof body.targetDate === 'string') {
    const targetDate = body.targetDate.trim()
    const { data: business } = await db
      .from('businesses')
      .select('timezone')
      .eq('id', auth.businessId)
      .maybeSingle()
    const timeZone = resolveBusinessTimeZone(business?.timezone)

    if (!isDateInWeek(targetDate, loaded.plan.week_start_date, timeZone)) {
      return NextResponse.json({ error: 'Date must be within the target week' }, { status: 400 })
    }

    const clash = loaded.items.some((i) => i.id !== itemId && i.target_date === targetDate)
    if (clash) {
      return NextResponse.json({ error: 'Another post is already on that date' }, { status: 400 })
    }
    patch.target_date = targetDate
  }

  if (typeof body.jobId === 'string') {
    const jobId = body.jobId.trim()
    if (jobId) {
      const allowed = await validateWeekPlanJobIds(db, auth.businessId, [jobId])
      if (!allowed.has(jobId)) {
        return NextResponse.json({ error: 'Invalid job' }, { status: 400 })
      }
      patch.job_id = jobId
    } else {
      patch.job_id = null
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await db
    .from('social_week_plan_items')
    .update(patch)
    .eq('id', itemId)
    .eq('plan_id', id)
    .eq('business_id', auth.businessId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: serializeItemRow(data) })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id, itemId } = await params
  const db = await createServiceClient()
  const loaded = await loadPlanForBusiness(db, auth.businessId, id)

  if (!loaded) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  try {
    assertPlanEditable(loaded.plan)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Plan cannot be edited' },
      { status: 409 },
    )
  }

  const { error } = await db
    .from('social_week_plan_items')
    .delete()
    .eq('id', itemId)
    .eq('plan_id', id)
    .eq('business_id', auth.businessId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
