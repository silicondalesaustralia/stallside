import type { SupabaseClient } from '@supabase/supabase-js'
import { dateKeyInTimeZone } from '@/lib/utils/australiaSydneyTime'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import { isPublishedHistoryImmutable } from '@/lib/social/socialPostTypes'

export async function rescheduleSocialPost(
  db: SupabaseClient,
  businessId: string,
  postId: string,
  scheduledFor: string,
  businessTimeZone: string,
): Promise<{ post: Record<string, unknown> }> {
  const { data: existing, error: loadErr } = await db
    .from('social_posts')
    .select('id, status, week_plan_item_id')
    .eq('id', postId)
    .eq('business_id', businessId)
    .single()

  if (loadErr || !existing) throw new Error('Post not found')
  if (isPublishedHistoryImmutable(existing)) throw new Error('Published posts cannot be rescheduled')
  if (existing.status !== 'scheduled') throw new Error('Only scheduled posts can be rescheduled')

  const postedAt = new Date().toISOString()
  const { data: post, error } = await db
    .from('social_posts')
    .update({ scheduled_for: scheduledFor, updated_at: postedAt })
    .eq('id', postId)
    .eq('business_id', businessId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (existing.week_plan_item_id) {
    const tz = resolveBusinessTimeZone(businessTimeZone)
    const targetDate = dateKeyInTimeZone(scheduledFor, tz)
    await db
      .from('social_week_plan_items')
      .update({ target_date: targetDate, updated_at: postedAt })
      .eq('id', existing.week_plan_item_id)
      .eq('business_id', businessId)
  }

  return { post }
}
