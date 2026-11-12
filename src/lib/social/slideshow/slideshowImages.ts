import type { SupabaseClient } from '@supabase/supabase-js'
import { isProxyableStorageUrl } from '@/lib/social/tiktok/tiktokMediaUrl'

const MAX_IMAGE_BYTES = 15 * 1024 * 1024
const FETCH_TIMEOUT_MS = 20_000

/**
 * Only fetch images from our own storage, or product photos already mirrored into this
 * business's job_photos. Anything else could be used to make the server fetch arbitrary URLs.
 */
export async function assertSlideshowImagesAllowed(
  db: SupabaseClient,
  businessId: string,
  urls: string[],
): Promise<void> {
  const external = [...new Set(urls.filter((url) => !isProxyableStorageUrl(url)))]
  if (!external.length) return
  const { data, error } = await db
    .from('job_photos')
    .select('url')
    .eq('business_id', businessId)
    .in('url', external)
  if (error) throw new Error(`Could not check your photos: ${error.message}`)
  const known = new Set((data ?? []).map((row) => row.url as string))
  if (external.some((url) => !known.has(url))) {
    throw new Error('Images must come from your products, uploads or Library.')
  }
}

export async function fetchSlideshowImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Could not load an image (HTTP ${res.status})`)
  const declared = Number(res.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > MAX_IMAGE_BYTES) throw new Error('An image is too large (15 MB max).')
  const bytes = Buffer.from(await res.arrayBuffer())
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error('An image is too large (15 MB max).')
  return bytes
}

/** Small JPEG for the vision model: keeps tokens and upload size down. */
export async function toVisionJpeg(bytes: Buffer): Promise<string> {
  const { default: sharp } = await import('sharp')
  const jpeg = await sharp(bytes)
    .rotate()
    .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer()
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`
}
