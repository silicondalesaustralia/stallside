import type { SupabaseClient } from '@supabase/supabase-js'
import { isPublishedHistoryImmutable } from '@/lib/social/socialPostTypes'

export type SocialPostCancelResult =
  | { ok: true; alreadyCancelled: boolean }
  | { ok: false; error: string }

/** Soft-cancel a future calendar entry - never hard-deletes. */
export async function cancelScheduledSocialPost(
  db: SupabaseClient,
  businessId: string,
  postId: string,
): Promise<SocialPostCancelResult> {
  const { data: post, error } = await db
    .from('social_posts')
    .select('id, status, business_id')
    .eq('id', postId)
    .eq('business_id', businessId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!post) return { ok: false, error: 'Post not found' }

  if (isPublishedHistoryImmutable(post)) {
    return { ok: false, error: 'Published posts cannot be cancelled' }
  }

  if (post.status === 'cancelled') {
    return { ok: true, alreadyCancelled: true }
  }

  if (post.status !== 'scheduled' && post.status !== 'draft' && post.status !== 'failed') {
    return { ok: false, error: `Cannot cancel post with status ${post.status}` }
  }

  const { error: updateErr } = await db
    .from('social_posts')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('business_id', businessId)

  if (updateErr) return { ok: false, error: updateErr.message }
  return { ok: true, alreadyCancelled: false }
}

/** Cancel linked post if still scheduled; never touch posted history. */
export async function cancelLinkedPlannerPostIfScheduled(
  db: SupabaseClient,
  businessId: string,
  postId: string | null,
): Promise<void> {
  if (!postId) return

  const { data: post } = await db
    .from('social_posts')
    .select('id, status')
    .eq('id', postId)
    .eq('business_id', businessId)
    .maybeSingle()

  if (!post || post.status === 'posted' || post.status === 'cancelled') return
  if (post.status === 'scheduled' || post.status === 'draft' || post.status === 'failed') {
    await cancelScheduledSocialPost(db, businessId, postId)
  }
}
