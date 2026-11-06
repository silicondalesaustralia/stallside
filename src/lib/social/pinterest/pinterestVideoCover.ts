import sharp from 'sharp'
import type { PinVideoCover } from '@/lib/social/pinterest/pinterestApi'

const COVER_MAX_WIDTH = 1080

export function pinImageUrl(processed: Record<string, string[]>): string | null {
  const url = processed.pinterest?.[0] ?? processed.instagram_square?.[0] ?? processed.facebook?.[0]
  return url && /^https:\/\//.test(url) ? url : null
}

/** The post's image, unless it is the video itself (videos with no thumbnail store the video URL). */
export function pinVideoCoverSourceUrl(processed: Record<string, string[]>, videoUrl: string | null): string | null {
  const url = pinImageUrl(processed)
  if (!url || url === videoUrl) return null
  return /\.(mp4|mov|m4v|webm)(\?|$)/i.test(url) ? null : url
}

/**
 * Pinterest rejects WebP video covers (Library thumbnails are WebP), so anything that
 * isn't JPEG/PNG is converted to JPEG and sent inline. Null means use the first frame.
 */
export async function resolvePinterestVideoCover(
  processed: Record<string, string[]>,
  videoUrl: string | null,
): Promise<PinVideoCover | null> {
  const url = pinVideoCoverSourceUrl(processed, videoUrl)
  if (!url) return null
  if (/\.(jpe?g|png)(\?|$)/i.test(url)) return { url }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Cover download failed (${res.status})`)
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate()
      .resize({ width: COVER_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()
    return { jpegBase64: jpeg.toString('base64') }
  } catch (err) {
    console.error('[Pinterest] Video cover conversion failed', { url, err })
    return null
  }
}
