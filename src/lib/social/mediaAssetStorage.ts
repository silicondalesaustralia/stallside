import type { SupabaseClient } from '@supabase/supabase-js'
import { SOCIAL_VIDEO_BUCKET } from '@/lib/social/socialVideoStorage'

export async function storageObjectMeta(
  db: SupabaseClient,
  path: string,
): Promise<{ exists: boolean; size: number | null }> {
  const slash = path.lastIndexOf('/')
  if (slash < 0) return { exists: false, size: null }
  const folder = path.slice(0, slash)
  const filename = path.slice(slash + 1)

  const { data, error } = await db.storage.from(SOCIAL_VIDEO_BUCKET).list(folder, {
    limit: 100,
    search: filename,
  })

  if (error || !data?.length) {
    return { exists: false, size: null }
  }

  const match = data.find((row) => row.name === filename)
  if (!match) return { exists: false, size: null }

  const rawSize = match.metadata?.size ?? match.metadata?.contentLength
  const size =
    typeof rawSize === 'number'
      ? rawSize
      : typeof rawSize === 'string'
        ? Number(rawSize)
        : null

  return {
    exists: true,
    size: size != null && Number.isFinite(size) ? size : null,
  }
}

export async function removeStoragePaths(
  db: SupabaseClient,
  paths: (string | null | undefined)[],
): Promise<void> {
  const unique = [...new Set(paths.filter((p): p is string => !!p?.trim()))]
  if (!unique.length) return
  const { error } = await db.storage.from(SOCIAL_VIDEO_BUCKET).remove(unique)
  if (error) {
    console.warn('[MediaAssets] storage remove failed', error.message)
  }
}
