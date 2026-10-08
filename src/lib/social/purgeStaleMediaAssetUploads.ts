import type { SupabaseClient } from '@supabase/supabase-js'
import { removeStoragePaths } from '@/lib/social/mediaAssetStorage'

/** Abandoned signed uploads (never finalized) should not live past this. */
export const MEDIA_ASSET_UPLOAD_MAX_AGE_MS = 48 * 60 * 60 * 1000
const PURGE_BATCH_LIMIT = 200

export function isStaleMediaAssetUpload(
  createdAt: string | null | undefined,
  nowMs: number,
  maxAgeMs: number = MEDIA_ASSET_UPLOAD_MAX_AGE_MS,
): boolean {
  if (!createdAt) return false
  const createdMs = Date.parse(createdAt)
  if (!Number.isFinite(createdMs)) return false
  return nowMs - createdMs >= maxAgeMs
}

export async function purgeStaleMediaAssetUploads(
  db: SupabaseClient,
  options?: { maxAgeMs?: number; nowMs?: number },
): Promise<{
  scanned: number
  deleted: number
  storageRemoved: number
  errors: string[]
}> {
  const maxAgeMs = options?.maxAgeMs ?? MEDIA_ASSET_UPLOAD_MAX_AGE_MS
  const nowMs = options?.nowMs ?? Date.now()
  const cutoff = new Date(nowMs - maxAgeMs).toISOString()
  const errors: string[] = []

  const { data: rows, error: listErr } = await db
    .from('social_media_assets')
    .select('id, business_id, storage_path, thumbnail_path, status, created_at')
    .eq('status', 'uploading')
    .lt('created_at', cutoff)
    .limit(PURGE_BATCH_LIMIT)

  if (listErr) {
    errors.push(listErr.message)
    return { scanned: 0, deleted: 0, storageRemoved: 0, errors }
  }

  const stale = rows ?? []
  if (!stale.length) {
    return { scanned: 0, deleted: 0, storageRemoved: 0, errors }
  }

  let storageRemoved = 0
  let deleted = 0

  for (const row of stale) {
    if (row.status !== 'uploading') continue

    const paths = [row.storage_path, row.thumbnail_path].filter(
      (p): p is string => !!p?.trim(),
    )
    if (paths.length) {
      await removeStoragePaths(db, paths)
      storageRemoved += paths.length
    }

    const { error: deleteErr } = await db
      .from('social_media_assets')
      .delete()
      .eq('id', row.id)
      .eq('business_id', row.business_id)
      .eq('status', 'uploading')

    if (deleteErr) {
      errors.push(`${row.id}: ${deleteErr.message}`)
    } else {
      deleted += 1
    }
  }

  return { scanned: stale.length, deleted, storageRemoved, errors }
}
