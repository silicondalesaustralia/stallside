import type { SupabaseClient } from '@supabase/supabase-js'
import { getPinterestAccessToken } from '@/lib/social/pinterest/pinterestAuth'
import { createPinFromSettings } from '@/lib/social/pinterest/pinterestApi'
import { sanitizePinterestSettings } from '@/lib/social/pinterest/pinterestSettings'
import { getPinterestMediaStatus } from '@/lib/social/pinterest/pinterestVideoUpload'
import { pinVideoCoverUrl } from '@/lib/social/pinterest/publishPinterestForPost'

const STALE_AFTER_MS = 24 * 60 * 60 * 1000

type PendingRow = {
  id: string
  business_id: string
  caption: string | null
  platform_captions: Record<string, unknown> | null
  pinterest_settings: unknown
  pinterest_media_id: string
  processed_photo_urls: Record<string, string[]> | null
  video_url: string | null
  created_at: string
  posted_at: string | null
  tiktok_post_id: string | null
  tiktok_publish_id: string | null
  tiktok_error: string | null
  youtube_post_id: string | null
}

export type PinterestSyncResult = { checked: number; completed: number; failed: number }

function otherPlatformAlive(row: PendingRow): boolean {
  return Boolean(row.youtube_post_id || row.tiktok_post_id || (row.tiktok_publish_id && !row.tiktok_error))
}

async function applyResult(db: SupabaseClient, row: PendingRow, update: Record<string, unknown>): Promise<void> {
  const failed = Boolean(update.pinterest_error)
  if (failed && !otherPlatformAlive(row)) update.status = 'failed'
  const { error } = await db.from('social_posts').update(update).eq('id', row.id)
  if (error) {
    console.error('[Pinterest sync] Update failed', { postId: row.id, error })
    return
  }
  await db.from('notifications').insert({
    business_id: row.business_id,
    type: 'social_post_published',
    message: failed
      ? `❌ Pinterest post failed: ${String(update.pinterest_error)}`
      : '✅ Your video Pin is live on Pinterest',
    read: false,
  })
}

async function syncRow(db: SupabaseClient, row: PendingRow, now: Date): Promise<'completed' | 'failed' | 'pending'> {
  const settings = sanitizePinterestSettings(row.pinterest_settings)
  if (!settings) {
    await applyResult(db, row, { pinterest_error: 'Pinterest board settings are missing.' })
    return 'failed'
  }
  const token = await getPinterestAccessToken(row.business_id)
  if (!token) {
    await applyResult(db, row, { pinterest_error: 'Pinterest is no longer connected.' })
    return 'failed'
  }
  const status = await getPinterestMediaStatus(token, row.pinterest_media_id)
  if (status === 'failed') {
    await applyResult(db, row, { pinterest_error: 'Pinterest could not process this video.' })
    return 'failed'
  }
  if (status !== 'succeeded') {
    if (now.getTime() - new Date(row.posted_at ?? row.created_at).getTime() <= STALE_AFTER_MS) return 'pending'
    await applyResult(db, row, { pinterest_error: 'Pinterest did not finish processing within 24 hours.' })
    return 'failed'
  }
  const override = row.platform_captions?.pinterest
  const caption = typeof override === 'string' && override.trim() ? override : row.caption ?? ''
  try {
    const pinId = await createPinFromSettings(token, settings, caption, {
      kind: 'video',
      mediaId: row.pinterest_media_id,
      coverImageUrl: pinVideoCoverUrl(row.processed_photo_urls ?? {}, row.video_url),
    })
    await applyResult(db, row, { pinterest_post_id: pinId })
    return 'completed'
  } catch (err) {
    console.error('[Pinterest sync] Create Pin failed', { postId: row.id, err })
    await applyResult(db, row, { pinterest_error: err instanceof Error ? err.message : 'Pinterest publish failed' })
    return 'failed'
  }
}

/** Create Pins for videos Pinterest finished processing after the publish request returned (cron). */
export async function syncPendingPinterestPosts(
  db: SupabaseClient,
  opts: { now?: Date } = {},
): Promise<PinterestSyncResult> {
  const result: PinterestSyncResult = { checked: 0, completed: 0, failed: 0 }
  const now = opts.now ?? new Date()
  const { data, error } = await db
    .from('social_posts')
    .select(
      'id, business_id, caption, platform_captions, pinterest_settings, pinterest_media_id, processed_photo_urls, video_url, created_at, posted_at, tiktok_post_id, tiktok_publish_id, tiktok_error, youtube_post_id',
    )
    .not('pinterest_media_id', 'is', null)
    .is('pinterest_post_id', null)
    .is('pinterest_error', null)
    .limit(50)
  if (error) {
    console.error('[Pinterest sync] Query failed', error)
    return result
  }

  for (const row of (data ?? []) as PendingRow[]) {
    result.checked++
    try {
      const outcome = await syncRow(db, row, now)
      if (outcome === 'completed') result.completed++
      if (outcome === 'failed') result.failed++
    } catch (err) {
      console.error('[Pinterest sync] Status check failed', { postId: row.id, err })
    }
  }
  return result
}
