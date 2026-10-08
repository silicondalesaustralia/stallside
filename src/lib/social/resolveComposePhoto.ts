import type { SupabaseClient } from '@supabase/supabase-js'
import {
  downloadInspirationTempImage,
  INSPIRATION_TEMP_BUCKET,
  isOwnedInspirationTempPath,
} from '@/lib/social/inspirationTempStorage'

export async function resolveOwnedComposePhotoUrl(
  db: SupabaseClient,
  businessId: string,
  storagePath: string,
): Promise<{ ok: true; url: string; path: string } | { ok: false; error: string; status: number }> {
  const path = storagePath.trim()
  if (!path || !isOwnedInspirationTempPath(businessId, path)) {
    return { ok: false, error: 'Photo is not available for this business.', status: 403 }
  }

  const downloaded = await downloadInspirationTempImage(db, path)
  if ('error' in downloaded) {
    return { ok: false, error: downloaded.error, status: 400 }
  }

  const { data, error } = await db.storage.from(INSPIRATION_TEMP_BUCKET).createSignedUrl(path, 60 * 60)
  if (error || !data?.signedUrl) {
    return { ok: false, error: 'Couldn’t load the uploaded photo. Please try again.', status: 400 }
  }
  return { ok: true, url: data.signedUrl, path }
}

export function isHttpsPhotoUrl(value: string | null | undefined): boolean {
  const raw = value?.trim()
  if (!raw) return false
  try {
    return new URL(raw).protocol === 'https:'
  } catch {
    return false
  }
}
