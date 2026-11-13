import type { SupabaseClient } from '@supabase/supabase-js'
import { isDueAutomaticPost } from '@/lib/social/socialPostTypes'
import {
  claimPostForPublishing,
  markFailed,
  notify,
  publishClaimedPost,
} from '@/lib/social/publishClaimedPost'

/** A claimed post older than this was cut off mid-publish (function timeout or crash). */
const PUBLISHING_STALE_MS = 15 * 60 * 1000

export type DueSocialPostRow = {
  id: string
  business_id: string
  status: string
  publishing_mode: string
  scheduled_for: string | null
  caption: string | null
  platforms: string[]
  photo_urls: string[] | null
  processed_photo_urls: unknown
  platform_captions?: Record<string, unknown> | null
  tiktok_settings?: unknown
  youtube_settings?: unknown
  pinterest_settings?: unknown
  media_type?: string | null
  video_url?: string | null
  video_duration_seconds?: number | string | null
}

/** Query filter for cron - manual and cancelled posts must never match. */
export function isEligibleForAutomaticPublish(post: Pick<DueSocialPostRow, 'status' | 'publishing_mode'>): boolean {
  return isDueAutomaticPost({
    status: post.status as 'scheduled',
    publishing_mode: post.publishing_mode as 'automatic' | 'manual',
  })
}

export function filterDueAutomaticPosts<T extends Pick<DueSocialPostRow, 'status' | 'publishing_mode' | 'scheduled_for'>>(
  posts: T[],
  now: Date,
): T[] {
  return posts.filter((post) => {
    if (!isEligibleForAutomaticPublish(post)) return false
    if (!post.scheduled_for) return false
    return new Date(post.scheduled_for).getTime() <= now.getTime()
  })
}

/** Posts stuck in 'publishing' past PUBLISHING_STALE_MS are failed so the owner can retry. */
async function failStalePublishingPosts(db: SupabaseClient, now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - PUBLISHING_STALE_MS).toISOString()
  const { data, error } = await db
    .from('social_posts')
    .select('*')
    .eq('status', 'publishing')
    .lt('publishing_started_at', cutoff)
  if (error) {
    console.error('[Social publish] Stale publishing query failed', error.message)
    return 0
  }
  const stale = (data ?? []) as DueSocialPostRow[]
  for (const post of stale) {
    await markFailed(db, post, 'Publishing did not finish. Check the platform, then tap Retry if it is not there.')
    await notify(db, post, false)
  }
  return stale.length
}

export type PublishDuePostsResult = { published: number; failed: number; skipped: number }

export async function publishDueAutomaticSocialPosts(
  db: SupabaseClient,
  now: Date = new Date(),
): Promise<PublishDuePostsResult> {
  const result: PublishDuePostsResult = { published: 0, failed: 0, skipped: 0 }

  const { data: duePosts, error } = await db
    .from('social_posts')
    .select('*')
    .eq('status', 'scheduled')
    .eq('publishing_mode', 'automatic')
    .lte('scheduled_for', now.toISOString())

  if (error) {
    console.error('[Social publish] Query failed', error)
    return result
  }

  for (const post of duePosts ?? []) {
    if (!isEligibleForAutomaticPublish(post)) {
      result.skipped++
      continue
    }
    const claim = await claimPostForPublishing(db, post.id, now)
    if (claim.status === 'taken') {
      result.skipped++
      continue
    }
    // Without the claim (status migration missing) publish the row as before.
    const row = claim.status === 'claimed' ? claim.post : (post as DueSocialPostRow)
    const outcome = await publishClaimedPost(db, row, now)
    if (outcome === 'posted') result.published++
    else result.failed++
  }

  result.failed += await failStalePublishingPosts(db, now)
  return result
}
