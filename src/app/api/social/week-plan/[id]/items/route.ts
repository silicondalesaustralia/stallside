import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { isWeekPlanPostType, resolveTaxonomyForPostType } from '@/lib/social/weekPlan/postTypeMapping'
import { validateWeekPlanJobIds } from '@/lib/social/weekPlan/recentJobs'
import { isDateInWeek } from '@/lib/social/weekPlan/weekIdentity'
import {
  assertPlanEditable,
  loadPlanForBusiness,
  serializeItemRow,
} from '@/lib/social/weekPlan/weekPlanService'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import { WEEK_PLAN_MAX_POSTS, WEEK_PLAN_TOPIC_MAX_CHARS } from '@/lib/social/weekPlan/types'

export async function POST(
  req: NextRequest,
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

  try {
    assertPlanEditable(loaded.plan)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Plan cannot be edited' },
      { status: 409 },
    )
  }

  if (loaded.items.length >= WEEK_PLAN_MAX_POSTS) {
    return NextResponse.json(
      { error: `Maximum ${WEEK_PLAN_MAX_POSTS} posts per week` },
      { status: 400 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const postTypeRaw = typeof body.postType === 'string' ? body.postType.trim() : 'tips_advice'
  if (!isWeekPlanPostType(postTypeRaw)) {
    return NextResponse.json({ error: 'Invalid post type' }, { status: 400 })
  }

  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  if (!topic || topic.length > WEEK_PLAN_TOPIC_MAX_CHARS) {
    return NextResponse.json({ error: 'Topic is required and must be under 200 characters' }, { status: 400 })
  }

  const targetDate = typeof body.targetDate === 'string' ? body.targetDate.trim() : ''
  const { data: business } = await db
    .from('businesses')
    .select('timezone')
    .eq('id', auth.businessId)
    .maybeSingle()

  const timeZone = resolveBusinessTimeZone(business?.timezone)
  if (!targetDate || !isDateInWeek(targetDate, loaded.plan.week_start_date, timeZone)) {
    return NextResponse.json({ error: 'Pick a date within the target week' }, { status: 400 })
  }

  const duplicateDate = loaded.items.some((i) => i.target_date === targetDate)
  if (duplicateDate) {
    return NextResponse.json({ error: 'A post is already planned for that date' }, { status: 400 })
  }

  let jobId: string | null =
    typeof body.jobId === 'string' && body.jobId.trim() ? body.jobId.trim() : null
  if (postTypeRaw === 'recent_job' && jobId) {
    const allowed = await validateWeekPlanJobIds(db, auth.businessId, [jobId])
    if (!allowed.has(jobId)) {
      return NextResponse.json({ error: 'Invalid job' }, { status: 400 })
    }
  } else {
    jobId = null
  }

  const taxonomy = resolveTaxonomyForPostType(postTypeRaw)
  const sortOrder = loaded.items.length

  const { data, error } = await db
    .from('social_week_plan_items')
    .insert({
      plan_id: loaded.plan.id,
      business_id: auth.businessId,
      sort_order: sortOrder,
      target_date: targetDate,
      post_type: postTypeRaw,
      subtype_id: taxonomy.subtypeId,
      intent_chip: taxonomy.intentChip,
      topic,
      job_id: jobId,
      platforms: loaded.plan.wizard_answers.platforms,
      status: 'planned',
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: serializeItemRow(data) })
}
