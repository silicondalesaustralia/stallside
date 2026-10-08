import type { SupabaseClient } from '@supabase/supabase-js'
import { publishPost } from '@/lib/socialPlatforms'
import { isDueAutomaticPost } from '@/lib/social/socialPostTypes'
import {
  tiktokPostSourceFromRow,
  tiktokResultColumns,
} from '@/lib/social/tiktok/publishTikTokForPost'

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

    try {
      const { data: business } = await db
        .from('businesses')
        .select([
          'facebook_page_id', 'facebook_access_token',
          'instagram_account_id',
          'gmb_account_id', 'gmb_location_id', 'gmb_access_token',
          'phone',
        ].join(', '))
        .eq('id', post.business_id)
        .single()

      if (!business || !post.caption) {
        await db.from('social_posts').update({
          status: 'failed',
          instagram_error: 'Missing caption or business',
        }).eq('id', post.id)
        result.failed++
        continue
      }

      const processedPhotoUrls: Record<string, string[]> = post.processed_photo_urls
        ? (post.processed_photo_urls as Record<string, string[]>)
        : { instagram_square: post.photo_urls || [] }

      const postResults = await publishPost({
        platforms: post.platforms,
        caption: post.caption,
        platformCaptions: post.platform_captions,
        processedPhotoUrls,
        businessId: post.business_id,
        business: business as Parameters<typeof publishPost>[0]['business'],
        tiktokPost: tiktokPostSourceFromRow(post as DueSocialPostRow),
      })

      const anySuccess = Object.values(postResults).some((r) => r?.success)
      const allFailed = Object.values(postResults).every((r) => r && !r.success)

      await db.from('social_posts').update({
        status: allFailed ? 'failed' : 'posted',
        posted_at: anySuccess ? now.toISOString() : null,
        facebook_post_id: postResults.facebook?.postId || null,
        facebook_error: postResults.facebook?.error || null,
        instagram_post_id: postResults.instagram?.postId || null,
        instagram_error: postResults.instagram?.error || null,
        gmb_post_id: postResults.gmb?.postId || null,
        gmb_error: postResults.gmb?.error || null,
        ...tiktokResultColumns(postResults.tiktok),
      }).eq('id', post.id)

      const platformNames = post.platforms.join(', ')
      await db.from('notifications').insert({
        business_id: post.business_id,
        type: 'social_post_published',
        message: anySuccess
          ? `✅ Your post was published to ${platformNames}`
          : `❌ Post failed to publish to ${platformNames} - tap to retry`,
        read: false,
      })

      anySuccess ? result.published++ : result.failed++
    } catch (err) {
      console.error('[Social publish] Post failed:', post.id, err)
      await db.from('social_posts').update({
        status: 'failed',
        instagram_error: String(err),
      }).eq('id', post.id)
      result.failed++
    }
  }

  return result
}
