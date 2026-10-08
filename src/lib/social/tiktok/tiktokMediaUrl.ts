import { createHmac, timingSafeEqual } from 'node:crypto'
import { requireTikTokCredentials, tiktokMediaOrigin } from '@/lib/social/tiktok/tiktokConfig'

function mediaSignature(postId: string, index: number): string {
  const { clientSecret } = requireTikTokCredentials()
  return createHmac('sha256', clientSecret)
    .update(`tiktok-media:${postId}:${index}`)
    .digest('base64url')
}

/** Public URL on the verified TikTok URL prefix that streams one post photo. */
export function tiktokPhotoProxyUrl(postId: string, index: number): string {
  const sig = mediaSignature(postId, index)
  return `${tiktokMediaOrigin()}/api/social/tiktok-media/${postId}/${index}?sig=${sig}`
}

export function verifyTikTokMediaSignature(postId: string, index: number, sig: string | null): boolean {
  if (!sig) return false
  const expected = Buffer.from(mediaSignature(postId, index))
  const actual = Buffer.from(sig)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

/** Only proxy files from this project's Supabase Storage (prevents SSRF via stored URLs). */
export function isProxyableStorageUrl(raw: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' && url.host === new URL(supabaseUrl).host
  } catch {
    return false
  }
}

/** Photo URLs TikTok should receive, preferring a TikTok-specific render. */
export function tiktokSourcePhotoUrls(processedPhotoUrls: Record<string, string[]>): string[] {
  return (
    processedPhotoUrls['tiktok'] ||
    processedPhotoUrls['instagram_square'] ||
    processedPhotoUrls['facebook'] ||
    []
  )
}
