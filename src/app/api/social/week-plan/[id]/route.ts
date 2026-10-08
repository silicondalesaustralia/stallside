import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { loadPlanForBusiness } from '@/lib/social/weekPlan/weekPlanService'
import { computeWeekProductionProgress } from '@/lib/social/weekPlan/weekPlanProduction'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import { countVariantPreviews } from '@/lib/social/weekPlan/weekPlanDisplayStatus'
import { isWeekPlanReadOnly } from '@/lib/social/weekPlan/weekPlanPermissions'
import { derivePlannerPublishState } from '@/lib/social/weekPlan/weekPlanPermissions'
import {
  parsePublishingMode,
  parseSocialPostStatus,
  type SocialPostStatus,
  type SocialPublishingMode,
} from '@/lib/social/socialPostTypes'

export type ScheduledPostDetail = {
  id: string
  scheduled_for: string | null
  platforms: string[]
  status: SocialPostStatus
  publishing_mode: SocialPublishingMode
  posted_at: string | null
  posted_manually: boolean
  publishState: string
}

export async function GET(
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

  const { data: business } = await db
    .from('businesses')
    .select('timezone')
    .eq('id', auth.businessId)
    .maybeSingle()

  const timeZone = resolveBusinessTimeZone(business?.timezone)
  const progress = computeWeekProductionProgress(loaded.items)
  const previewCount = loaded.items.reduce(
    (n, i) => n + countVariantPreviews([i]),
    0,
  )

  const scheduledPostIds = loaded.items
    .map((i) => i.scheduled_social_post_id)
    .filter(Boolean) as string[]

  const itemIds = loaded.items.map((i) => i.id)

  let scheduledPosts: Record<string, ScheduledPostDetail> = {}
  const publishedByItemId: Record<string, ScheduledPostDetail> = {}

  if (scheduledPostIds.length > 0) {
    const { data: posts } = await db
      .from('social_posts')
      .select('id, scheduled_for, platforms, status, publishing_mode, posted_at, posted_manually, week_plan_item_id')
      .eq('business_id', auth.businessId)
      .in('id', scheduledPostIds)
    for (const p of posts ?? []) {
      const status = parseSocialPostStatus(p.status)
      const publishingMode = parsePublishingMode(p.publishing_mode) ?? 'automatic'
      if (!status) continue
      scheduledPosts[p.id] = {
        id: p.id,
        scheduled_for: p.scheduled_for,
        platforms: Array.isArray(p.platforms) ? p.platforms : [],
        status,
        publishing_mode: publishingMode,
        posted_at: p.posted_at,
        posted_manually: Boolean(p.posted_manually),
        publishState: '',
      }
    }
  }

  if (itemIds.length > 0) {
    const { data: linkedPublished } = await db
      .from('social_posts')
      .select('id, scheduled_for, platforms, status, publishing_mode, posted_at, posted_manually, week_plan_item_id')
      .eq('business_id', auth.businessId)
      .eq('status', 'posted')
      .in('week_plan_item_id', itemIds)

    for (const p of linkedPublished ?? []) {
      if (p.week_plan_item_id) {
        const status = parseSocialPostStatus(p.status)
        const publishingMode = parsePublishingMode(p.publishing_mode) ?? 'automatic'
        if (!status) continue
        publishedByItemId[p.week_plan_item_id] = {
          id: p.id,
          scheduled_for: p.scheduled_for,
          platforms: Array.isArray(p.platforms) ? p.platforms : [],
          status,
          publishing_mode: publishingMode,
          posted_at: p.posted_at,
          posted_manually: Boolean(p.posted_manually),
          publishState: '',
        }
      }
    }
  }

  const itemPublishStates: Record<string, string> = {}
  for (const item of loaded.items) {
    const linked = item.scheduled_social_post_id
      ? scheduledPosts[item.scheduled_social_post_id] ?? null
      : null
    const publishedLink = publishedByItemId[item.id] ?? null
    const state = derivePlannerPublishState(item, linked, publishedLink)
    itemPublishStates[item.id] = state
    if (linked) linked.publishState = state
  }

  const readOnly = isWeekPlanReadOnly(loaded.plan)

  return NextResponse.json({
    ...loaded,
    timeZone,
    progress,
    previewCount,
    scheduledPosts,
    publishedByItemId,
    itemPublishStates,
    readOnly,
  })
}
