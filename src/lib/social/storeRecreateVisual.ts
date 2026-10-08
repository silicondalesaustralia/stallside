/**
 * Neutral store/convert for Recreate visuals - no scene overlay, scrim, or CTA pill.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { convertToWebP, isSharpAvailable } from '@/lib/imageProcessor'

export async function storeRecreateVisual(
  db: SupabaseClient,
  input: {
    businessId: string
    renderId: string
    buffer: Buffer
    storagePath?: string
  },
): Promise<{ imageUrl: string; storagePath: string }> {
  if (!(await isSharpAvailable())) {
    throw new Error('Image processing unavailable, please try again')
  }
  const webp = await convertToWebP(input.buffer, 1024, 85, true)
  const storagePath =
    input.storagePath?.trim() ||
    `${input.businessId}/inspiration-preview/${input.renderId}.webp`
  const { error } = await db.storage
    .from('social-posts')
    .upload(storagePath, webp, { contentType: 'image/webp', upsert: true })
  if (error) throw new Error(error.message || 'Upload failed')
  const {
    data: { publicUrl },
  } = db.storage.from('social-posts').getPublicUrl(storagePath)
  return { imageUrl: publicUrl, storagePath }
}
