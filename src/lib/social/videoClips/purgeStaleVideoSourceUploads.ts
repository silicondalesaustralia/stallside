import type { SupabaseClient } from '@supabase/supabase-js'
import { deleteR2Object, isR2Configured } from '@/lib/social/videoClips/r2'

/** Abandoned source uploads. Library clips are a different table and are not selected. */
export const STALE_VIDEO_SOURCE_UPLOAD_MS = 48 * 60 * 60 * 1000

export function isStaleVideoSourceUpload(
  status: string,
  createdAt: string | null | undefined,
  nowMs: number,
  maxAgeMs = STALE_VIDEO_SOURCE_UPLOAD_MS,
): boolean {
  if (status !== 'uploading') return false
  if (!createdAt) return false
  const createdMs = Date.parse(createdAt)
  if (!Number.isFinite(createdMs)) return false
  return nowMs - createdMs >= maxAgeMs
}

export async function purgeStaleVideoSourceUploads(
  db: SupabaseClient,
  options?: { nowMs?: number; maxAgeMs?: number },
): Promise<{ scanned: number; deleted: number; errors: string[] }> {
  const nowMs = options?.nowMs ?? Date.now()
  const maxAgeMs = options?.maxAgeMs ?? STALE_VIDEO_SOURCE_UPLOAD_MS
  const cutoff = new Date(nowMs - maxAgeMs).toISOString()
  const errors: string[] = []

  const { data, error } = await db
    .from('social_video_sources')
    .select('id, storage_path, status, created_at')
    .eq('status', 'uploading')
    .lt('created_at', cutoff)
    .limit(100)
  if (error) throw new Error(error.message)

  const rows = (data as { id: string; storage_path: string; status: string; created_at: string }[] | null) ?? []
  let deleted = 0
  for (const row of rows) {
    if (!isStaleVideoSourceUpload(row.status, row.created_at, nowMs, maxAgeMs)) continue
    try {
      if (row.storage_path && isR2Configured()) {
        await deleteR2Object(row.storage_path)
      }
      const { error: deleteErr } = await db.from('social_video_sources').delete().eq('id', row.id).eq('status', 'uploading')
      if (deleteErr) {
        errors.push(deleteErr.message)
        continue
      }
      deleted += 1
      console.log('[VideoClips] expired stale uploading source', row.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'stale_source_purge_failed'
      errors.push(message)
      console.error('[VideoClips] stale source purge failed', row.id, message)
    }
  }

  return { scanned: rows.length, deleted, errors }
}
