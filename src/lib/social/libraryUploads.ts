import type { SupabaseClient } from '@supabase/supabase-js'

export const UPLOAD_LIBRARY_PRESET = 'upload'

/**
 * Photos uploaded in Create (post photo, slideshow images, TikTok slides) become Library photos.
 * Never throws: the upload still succeeds if Library saving fails.
 */
export async function saveUploadsToLibrary(db: SupabaseClient, businessId: string, urls: string[]): Promise<void> {
  if (!urls.length) return
  const rows = urls.map((url) => ({
    business_id: businessId,
    preset: UPLOAD_LIBRARY_PRESET,
    platform: 'instagram',
    photo_source: 'upload',
    photo_url: url,
    result_url: url,
    content: {},
    status: 'completed',
  }))
  const { error } = await db.from('hybrid_social_renders').insert(rows)
  if (error) console.warn('[Upload] saving photos to Library failed', { businessId, error: error.message })
}
