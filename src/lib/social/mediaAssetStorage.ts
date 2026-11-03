import type { SupabaseClient } from '@supabase/supabase-js'
import { SOCIAL_VIDEO_BUCKET } from '@/lib/social/socialVideoStorage'
import { isLibraryR2Path } from '@/lib/social/libraryVideoR2'
import { deleteR2Object } from '@/lib/social/videoClips/r2'

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
  const all = [...new Set(paths.filter((p): p is string => !!p?.trim()))]
  const r2Keys = all.filter(isLibraryR2Path)
  const unique = all.filter((p) => !isLibraryR2Path(p))
  for (const key of r2Keys) {
    try {
      await deleteR2Object(key)
    } catch (err) {
      console.warn('[MediaAssets] R2 remove failed', key, err instanceof Error ? err.message : err)
    }
  }
  if (!unique.length) return
  const { error } = await db.storage.from(SOCIAL_VIDEO_BUCKET).remove(unique)
  if (error) {
    console.warn('[MediaAssets] storage remove failed', error.message)
  }
}
