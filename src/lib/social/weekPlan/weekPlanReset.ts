import type { SupabaseClient } from '@supabase/supabase-js'
import { scheduledForFromLocalDateTime } from '@/lib/social/libraryPublish'
import { isPublishedHistoryImmutable } from '@/lib/social/socialPostTypes'
import { cancelLinkedPlannerPostIfScheduled } from '@/lib/social/socialPostCancellation'
import type { WeekPlanItemRow, WeekPlanRow } from '@/lib/social/weekPlan/types'
import { loadPlanForBusiness, serializeItemRow } from '@/lib/social/weekPlan/weekPlanService'
import { syncPlanProductionComplete } from '@/lib/social/weekPlan/weekPlanProduction'

function preserveTimeOnNewDate(currentScheduledFor: string, newDate: string): string {
  const current = new Date(currentScheduledFor)
  const hours = String(current.getHours()).padStart(2, '0')
  const minutes = String(current.getMinutes()).padStart(2, '0')
  return scheduledForFromLocalDateTime(newDate, `${hours}:${minutes}`)
}

async function loadOwnedItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<{ plan: WeekPlanRow; item: WeekPlanItemRow } | null> {
  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) return null
  const item = loaded.items.find((i) => i.id === itemId)
  if (!item) return null
  return { plan: loaded.plan, item }
}

async function loadLinkedPost(
  db: SupabaseClient,
  businessId: string,
  postId: string | null,
) {
  if (!postId) return null
  const { data } = await db
    .from('social_posts')
    .select('id, status, publishing_mode, scheduled_for, posted_at, posted_manually, platforms')
    .eq('id', postId)
    .eq('business_id', businessId)
    .maybeSingle()
  return data
}

export async function chooseAgainWeekPlanItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { plan, item } = loaded

  const linked = await loadLinkedPost(db, businessId, item.scheduled_social_post_id)
  if (linked && !isPublishedHistoryImmutable(linked)) {
    await cancelLinkedPlannerPostIfScheduled(db, businessId, linked.id)
  }

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      selected_variant_id: null,
      hybrid_render_id: null,
      approved_at: null,
      scheduled_social_post_id: null,
      review_status: 'needs_selection',
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  const updated = serializeItemRow(data)

  await db
    .from('social_week_plans')
    .update({ completed_at: null, updated_at: now })
    .eq('id', plan.id)
    .eq('business_id', businessId)

  return updated
}

export async function startAgainWeekPlanItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<WeekPlanItemRow> {
  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { plan, item } = loaded

  const linked = await loadLinkedPost(db, businessId, item.scheduled_social_post_id)
  if (linked && !isPublishedHistoryImmutable(linked)) {
    await cancelLinkedPlannerPostIfScheduled(db, businessId, linked.id)
  }

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      variant_previews: null,
      variant_previews_previous: null,
      selected_variant_id: null,
      caption: null,
      hybrid_render_id: null,
      approved_at: null,
      scheduled_social_post_id: null,
      generation_id: null,
      generation_status: 'not_started',
      generation_error: null,
      generation_started_at: null,
      generation_completed_at: null,
      review_status: 'needs_selection',
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  const updated = serializeItemRow(data)

  await db
    .from('social_week_plans')
    .update({ completed_at: null, updated_at: now })
    .eq('id', plan.id)
    .eq('business_id', businessId)

  return updated
}

export type ResetSelectionsSummary = {
  selectionsReset: number
  schedulesCancelled: number
  publishedPreserved: number
}

export async function resetWeekSelections(
  db: SupabaseClient,
  businessId: string,
  planId: string,
): Promise<{ items: WeekPlanItemRow[]; summary: ResetSelectionsSummary }> {
  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) throw new Error('Plan not found')

  const summary: ResetSelectionsSummary = {
    selectionsReset: 0,
    schedulesCancelled: 0,
    publishedPreserved: 0,
  }

  const now = new Date().toISOString()
  const updatedItems: WeekPlanItemRow[] = []

  for (const item of loaded.items) {
    if (item.review_status === 'skipped') {
      updatedItems.push(item)
      continue
    }

    const linked = await loadLinkedPost(db, businessId, item.scheduled_social_post_id)
    if (linked?.status === 'posted') {
      summary.publishedPreserved++
    } else if (linked && linked.status === 'scheduled') {
      await cancelLinkedPlannerPostIfScheduled(db, businessId, linked.id)
      summary.schedulesCancelled++
    }

    if (
      item.selected_variant_id ||
      item.hybrid_render_id ||
      item.review_status !== 'needs_selection'
    ) {
      summary.selectionsReset++
    }

    const { data, error } = await db
      .from('social_week_plan_items')
      .update({
        selected_variant_id: null,
        hybrid_render_id: null,
        approved_at: null,
        scheduled_social_post_id: null,
        review_status: 'needs_selection',
        updated_at: now,
      })
      .eq('id', item.id)
      .eq('business_id', businessId)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    updatedItems.push(serializeItemRow(data))
  }

  await db
    .from('social_week_plans')
    .update({ completed_at: null, updated_at: now })
    .eq('id', planId)
    .eq('business_id', businessId)

  return { items: updatedItems, summary }
}

export async function rebuildWeekPlan(
  db: SupabaseClient,
  businessId: string,
  planId: string,
): Promise<{ plan: WeekPlanRow; items: WeekPlanItemRow[] }> {
  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) throw new Error('Plan not found')

  const now = new Date().toISOString()

  for (const item of loaded.items) {
    const linked = await loadLinkedPost(db, businessId, item.scheduled_social_post_id)
    if (linked && linked.status !== 'posted') {
      await cancelLinkedPlannerPostIfScheduled(db, businessId, linked.id)
    }

    const { error } = await db
      .from('social_week_plan_items')
      .update({
        variant_previews: null,
        variant_previews_previous: null,
        selected_variant_id: null,
        caption: null,
        hybrid_render_id: null,
        approved_at: null,
        scheduled_social_post_id: null,
        skipped_at: null,
        generation_id: null,
        generation_status: 'not_started',
        generation_error: null,
        generation_started_at: null,
        generation_completed_at: null,
        review_status: 'needs_selection',
        updated_at: now,
      })
      .eq('id', item.id)
      .eq('business_id', businessId)

    if (error) throw new Error(error.message)
  }

  const { data: planRow, error: planErr } = await db
    .from('social_week_plans')
    .update({
      status: 'draft',
      generation_status: 'not_started',
      generation_started_at: null,
      completed_at: null,
      approved_at: null,
      approved_by_user_id: null,
      updated_at: now,
    })
    .eq('id', planId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (planErr) throw new Error(planErr.message)

  const reloaded = await loadPlanForBusiness(db, businessId, planId)
  if (!reloaded) throw new Error('Plan not found after rebuild')

  return { plan: reloaded.plan, items: reloaded.items }
}

export async function moveWeekPlanItemDate(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
  targetDate: string,
): Promise<WeekPlanItemRow> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
    throw new Error('Invalid target date')
  }

  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')
  const { item } = loaded

  const linked = await loadLinkedPost(db, businessId, item.scheduled_social_post_id)
  if (linked && isPublishedHistoryImmutable(linked)) {
    throw new Error('Cannot move a published post')
  }

  const now = new Date().toISOString()

  if (linked?.status === 'scheduled' && linked.scheduled_for) {
    const newScheduledFor = preserveTimeOnNewDate(linked.scheduled_for, targetDate.trim())
    const { error: postErr } = await db
      .from('social_posts')
      .update({ scheduled_for: newScheduledFor, updated_at: now })
      .eq('id', linked.id)
      .eq('business_id', businessId)
      .eq('status', 'scheduled')

    if (postErr) throw new Error(postErr.message)
  }

  const { data, error } = await db
    .from('social_week_plan_items')
    .update({ target_date: targetDate.trim(), updated_at: now })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializeItemRow(data)
}

export async function markManualSocialPostPosted(
  db: SupabaseClient,
  businessId: string,
  postId: string,
): Promise<{ alreadyPosted: boolean; postedAt: string | null }> {
  const { data: post, error } = await db
    .from('social_posts')
    .select('id, status, publishing_mode, posted_manually, posted_at')
    .eq('id', postId)
    .eq('business_id', businessId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!post) throw new Error('Post not found')
  if (post.publishing_mode !== 'manual') {
    throw new Error('Only manual posts can be marked as posted through this action')
  }
  if (post.status === 'posted' && post.posted_manually) {
    return { alreadyPosted: true, postedAt: post.posted_at }
  }
  if (post.status !== 'scheduled') {
    throw new Error('Only scheduled manual posts can be marked as posted')
  }

  const postedAt = new Date().toISOString()
  const { error: updateErr } = await db
    .from('social_posts')
    .update({
      status: 'posted',
      posted_manually: true,
      posted_at: postedAt,
      updated_at: postedAt,
    })
    .eq('id', postId)
    .eq('business_id', businessId)

  if (updateErr) throw new Error(updateErr.message)
  return { alreadyPosted: false, postedAt }
}
