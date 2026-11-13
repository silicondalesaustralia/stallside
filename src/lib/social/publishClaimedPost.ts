import type { SupabaseClient } from '@supabase/supabase-js'
import { publishPost } from '@/lib/socialPlatforms'
import { tiktokPostSourceFromRow, tiktokResultColumns } from '@/lib/social/tiktok/publishTikTokForPost'
import { youtubePostSourceFromRow, youtubeResultColumns } from '@/lib/social/youtube/publishYouTubeForPost'
import { pinterestPostSourceFromRow, pinterestResultColumns } from '@/lib/social/pinterest/publishPinterestForPost'
import { xResultColumns } from '@/lib/social/x/publishXForPost'
import type { DueSocialPostRow } from '@/lib/social/publishDueSocialPosts'

const ERROR_COLUMNS = ['facebook', 'instagram', 'gmb', 'tiktok'] as const

/** Platforms with their own error column; anything else reports on instagram_error. */
function errorColumn(platforms: string[]): string {
  const match = ERROR_COLUMNS.find((p) => platforms.includes(p))
  return `${match ?? 'instagram'}_error`
}

export type ClaimResult =
  | { status: 'claimed'; post: DueSocialPostRow }
  /** Another worker already has it, or it is no longer due. */
  | { status: 'taken' }
  /** The claim itself failed, e.g. 018_social_posts_publishing.sql has not been applied. */
  | { status: 'error' }

/** Moves a due automatic post from 'scheduled' to 'publishing' so only one worker publishes it. */
export async function claimPostForPublishing(
  db: SupabaseClient,
  postId: string,
  now: Date = new Date(),
): Promise<ClaimResult> {
  const { data, error } = await db
    .from('social_posts')
    .update({ status: 'publishing', publishing_started_at: now.toISOString() })
    .eq('id', postId)
    .eq('status', 'scheduled')
    .eq('publishing_mode', 'automatic')
    .select('*')
    .maybeSingle()
  if (error) {
    console.error('[Social publish] Claim failed', { postId, error: error.message })
    return { status: 'error' }
  }
  return data ? { status: 'claimed', post: data as DueSocialPostRow } : { status: 'taken' }
}

export async function notify(db: SupabaseClient, post: DueSocialPostRow, success: boolean): Promise<void> {
  const platformNames = post.platforms.join(', ')
  const { error } = await db.from('notifications').insert({
    business_id: post.business_id,
    type: 'social_post_published',
    message: success
      ? `✅ Your post was published to ${platformNames}`
      : `❌ Post failed to publish to ${platformNames} - tap to retry`,
    read: false,
  })
  if (error) console.error('[Social publish] Notification failed', { postId: post.id, error: error.message })
}

export async function markFailed(db: SupabaseClient, post: DueSocialPostRow, message: string): Promise<void> {
  const { error } = await db
    .from('social_posts')
    .update({ status: 'failed', [errorColumn(post.platforms)]: message })
    .eq('id', post.id)
  if (error) console.error('[Social publish] Marking failed did not save', { postId: post.id, error: error.message })
}

/** Publishes a post already claimed with claimPostForPublishing and saves every platform's result. */
export async function publishClaimedPost(
  db: SupabaseClient,
  post: DueSocialPostRow,
  now: Date = new Date(),
): Promise<'posted' | 'failed'> {
  try {
    const { data: business } = await db
      .from('businesses')
      .select('facebook_page_id, facebook_access_token, instagram_account_id, gmb_account_id, gmb_location_id, gmb_access_token, phone')
      .eq('id', post.business_id)
      .single()

    if (!business || !post.caption) {
      await markFailed(db, post, 'Missing caption or business')
      await notify(db, post, false)
      return 'failed'
    }

    const processedPhotoUrls = post.processed_photo_urls
      ? (post.processed_photo_urls as Record<string, string[]>)
      : { instagram_square: post.photo_urls || [] }

    const results = await publishPost({
      platforms: post.platforms,
      caption: post.caption,
      platformCaptions: post.platform_captions,
      processedPhotoUrls,
      businessId: post.business_id,
      business: business as Parameters<typeof publishPost>[0]['business'],
      tiktokPost: tiktokPostSourceFromRow(post),
      youtubePost: youtubePostSourceFromRow(post),
      pinterestPost: pinterestPostSourceFromRow(post),
      xPost: { postId: post.id, mediaType: post.media_type ?? null },
      videoUrl: post.media_type === 'video' && post.video_url ? post.video_url : null,
    })

    const anySuccess = Object.values(results).some((r) => r?.success)
    const allFailed = Object.values(results).every((r) => r && !r.success)
    const { error: saveError } = await db.from('social_posts').update({
      status: allFailed ? 'failed' : 'posted',
      posted_at: anySuccess ? now.toISOString() : null,
      facebook_post_id: results.facebook?.postId || null,
      facebook_error: results.facebook?.error || null,
      instagram_post_id: results.instagram?.postId || null,
      instagram_error: results.instagram?.error || null,
      gmb_post_id: results.gmb?.postId || null,
      gmb_error: results.gmb?.error || null,
      ...tiktokResultColumns(results.tiktok),
      ...youtubeResultColumns(results.youtube),
      ...pinterestResultColumns(results.pinterest),
      ...xResultColumns(results.x),
    }).eq('id', post.id)
    if (saveError) console.error('[Social publish] Saving results failed', { postId: post.id, saveError })

    await notify(db, post, anySuccess)
    return anySuccess ? 'posted' : 'failed'
  } catch (err) {
    console.error('[Social publish] Post failed:', post.id, err)
    await markFailed(db, post, err instanceof Error ? err.message : String(err))
    await notify(db, post, false)
    return 'failed'
  }
}