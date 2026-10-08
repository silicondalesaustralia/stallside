import type { SupabaseClient } from '@supabase/supabase-js'
import { getTikTokAccessToken } from '@/lib/social/tiktok/tiktokAuth'
import {
  fetchTikTokPublishStatus,
  isTerminalTikTokStatus,
  tiktokStatusColumns,
} from '@/lib/social/tiktok/tiktokPublishStatus'

const STALE_AFTER_MS = 24 * 60 * 60 * 1000

type PendingRow = {
  id: string
  business_id: string
  platforms: string[]
  tiktok_publish_id: string
  created_at: string
  posted_at: string | null
  facebook_post_id: string | null
  instagram_post_id: string | null
  gmb_post_id: string | null
}

export type TikTokSyncResult = { checked: number; completed: number; failed: number }

function otherPlatformSucceeded(row: PendingRow): boolean {
  return Boolean(row.facebook_post_id || row.instagram_post_id || row.gmb_post_id)
}

async function applyResult(
  db: SupabaseClient,
  row: PendingRow,
  update: Record<string, unknown>,
  failed: boolean,
): Promise<void> {
  if (failed && !otherPlatformSucceeded(row)) update.status = 'failed'
  const { error } = await db.from('social_posts').update(update).eq('id', row.id)
  if (error) {
    console.error('[TikTok sync] Update failed', { postId: row.id, error })
    return
  }
  await db.from('notifications').insert({
    business_id: row.business_id,
    type: 'social_post_published',
    message: failed
      ? `❌ TikTok post failed: ${String(update.tiktok_error ?? 'unknown error')}`
      : '✅ Your post is live on TikTok',
    read: false,
  })
}

/** Resolve async TikTok publishes (called from cron and right after publish). */
export async function syncPendingTikTokPosts(
  db: SupabaseClient,
  opts: { postId?: string; now?: Date } = {},
): Promise<TikTokSyncResult> {
  const result: TikTokSyncResult = { checked: 0, completed: 0, failed: 0 }
  const now = opts.now ?? new Date()

  let query = db
    .from('social_posts')
    .select('id, business_id, platforms, tiktok_publish_id, created_at, posted_at, facebook_post_id, instagram_post_id, gmb_post_id')
    .not('tiktok_publish_id', 'is', null)
    .is('tiktok_post_id', null)
    .is('tiktok_error', null)
    .limit(50)
  if (opts.postId) query = query.eq('id', opts.postId)

  const { data, error } = await query
  if (error) {
    console.error('[TikTok sync] Query failed', error)
    return result
  }

  for (const row of (data ?? []) as PendingRow[]) {
    result.checked++
    try {
      if (row.tiktok_publish_id.startsWith('demo-tiktok-')) {
        await applyResult(db, row, { tiktok_status: 'PUBLISH_COMPLETE', tiktok_post_id: row.tiktok_publish_id }, false)
        result.completed++
        continue
      }
      const token = await getTikTokAccessToken(row.business_id)
      if (!token) {
        await applyResult(db, row, { tiktok_error: 'TikTok is no longer connected.' }, true)
        result.failed++
        continue
      }
      const snapshot = await fetchTikTokPublishStatus(token, row.tiktok_publish_id)
      const columns = tiktokStatusColumns(row.tiktok_publish_id, snapshot)
      if (isTerminalTikTokStatus(snapshot.status)) {
        const failed = Boolean(columns.tiktok_error)
        await applyResult(db, row, { ...columns }, failed)
        if (failed) result.failed++
        else result.completed++
      } else if (now.getTime() - new Date(row.posted_at ?? row.created_at).getTime() > STALE_AFTER_MS) {
        await applyResult(db, row, { tiktok_status: snapshot.status, tiktok_error: 'TikTok did not finish processing within 24 hours.' }, true)
        result.failed++
      } else {
        await db.from('social_posts').update({ tiktok_status: snapshot.status }).eq('id', row.id)
      }
    } catch (err) {
      console.error('[TikTok sync] Status check failed', { postId: row.id, err })
    }
  }
  return result
}
