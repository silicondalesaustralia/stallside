// ============================================================
// lib/social/instagramJpeg.ts
// Instagram Content Publishing only accepts JPEG images. Our stored
// social images are WebP, so publish uses a JPEG copy instead.
// ============================================================

import { createServiceClient } from '@/lib/supabase/server'

const SOCIAL_BUCKET = 'social-posts'

function isJpegUrl(url: string): boolean {
  try {
    return /\.jpe?g$/i.test(new URL(url).pathname)
  } catch {
    return false
  }
}

/** Returns a public JPEG URL for the image, converting and uploading if needed. */
export async function ensureInstagramJpegUrl(imageUrl: string, businessId: string): Promise<string> {
  if (!imageUrl) throw new Error('No image to publish to Instagram')
  if (isJpegUrl(imageUrl)) return imageUrl

  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Could not download image for Instagram (HTTP ${res.status})`)
  const source = Buffer.from(await res.arrayBuffer())

  const { default: sharp } = await import('sharp')
  const jpeg = await sharp(source)
    .rotate()
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 90 })
    .toBuffer()

  const db = await createServiceClient()
  const path = `${businessId}/instagram/${Date.now()}.jpg`
  const { error } = await db.storage
    .from(SOCIAL_BUCKET)
    .upload(path, jpeg, { contentType: 'image/jpeg', upsert: true })
  if (error) throw new Error(`Instagram JPEG upload failed: ${error.message}`)

  return db.storage.from(SOCIAL_BUCKET).getPublicUrl(path).data.publicUrl
}
