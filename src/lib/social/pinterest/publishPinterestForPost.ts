import { getPinterestAccessToken } from '@/lib/social/pinterest/pinterestAuth'
import { createPinFromSettings } from '@/lib/social/pinterest/pinterestApi'
import { sanitizePinterestSettings } from '@/lib/social/pinterest/pinterestSettings'
import { publishPinterestVideo } from '@/lib/social/pinterest/pinterestVideoPublish'
import { isProxyableStorageUrl } from '@/lib/social/tiktok/tiktokMediaUrl'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

export type PinterestPublishResult = {
  success: boolean
  postId?: string
  /** Video still processing on Pinterest; the cron creates the Pin later. */
  mediaId?: string
  error?: string
  demo?: boolean
}

export type PinterestPostSource = {
  postId: string
  businessId: string
  caption: string
  pinterestSettings: unknown
  mediaType: string | null
  videoUrl: string | null
  processedPhotoUrls: Record<string, string[]>
}

type SocialPostPinterestRow = {
  id: string
  pinterest_settings?: unknown
  media_type?: string | null
  video_url?: string | null
}

export function pinterestPostSourceFromRow(
  row: SocialPostPinterestRow,
): Omit<PinterestPostSource, 'businessId' | 'caption' | 'processedPhotoUrls'> {
  return {
    postId: row.id,
    pinterestSettings: row.pinterest_settings ?? null,
    mediaType: row.media_type ?? null,
    videoUrl: row.video_url ?? null,
  }
}

/** social_posts columns after a publish attempt ({} when Pinterest was not targeted). */
export function pinterestResultColumns(result: PinterestPublishResult | undefined): Record<string, unknown> {
  if (!result) return {}
  return {
    pinterest_post_id: result.success ? result.postId ?? null : null,
    pinterest_error: result.success ? null : result.error ?? 'Pinterest publish failed',
    ...(result.mediaId ? { pinterest_media_id: result.mediaId } : {}),
  }
}

export function pinImageUrl(processed: Record<string, string[]>): string | null {
  const url = processed.pinterest?.[0] ?? processed.instagram_square?.[0] ?? processed.facebook?.[0]
  return url && /^https:\/\//.test(url) ? url : null
}

/**
 * Video Pin covers must be JPEG or PNG: Library thumbnails are WebP, and a video with no
 * thumbnail stores the video URL as its image. Anything else falls back to the first frame.
 */
export function pinVideoCoverUrl(processed: Record<string, string[]>, videoUrl: string | null): string | null {
  const url = pinImageUrl(processed)
  if (!url || url === videoUrl) return null
  return /\.(jpe?g|png)(\?|$)/i.test(url) ? url : null
}

/** Resolve token + media for one social_posts row and create the Pin (video may finish later). */
export async function publishPinterestForPost(src: PinterestPostSource): Promise<PinterestPublishResult> {
  const settings = sanitizePinterestSettings(src.pinterestSettings)
  if (!settings) return { success: false, error: 'Pick a Pinterest board before posting' }
  const imageUrl = pinImageUrl(src.processedPhotoUrls)
  const videoUrl = src.mediaType === 'video' ? src.videoUrl : null
  if (src.mediaType === 'video' && (!videoUrl || !isProxyableStorageUrl(videoUrl))) {
    return { success: false, error: 'Video must come from your Library' }
  }
  if (!videoUrl && !imageUrl) return { success: false, error: 'Pinterest needs an image from your uploads or Library' }
  if (DEMO) {
    console.log('[Demo] Would create Pinterest Pin:', src.postId)
    return { success: true, postId: `demo-pin-${Date.now()}`, demo: true }
  }

  try {
    const accessToken = await getPinterestAccessToken(src.businessId)
    if (!accessToken) return { success: false, error: 'Pinterest is not connected' }
    if (videoUrl) {
      const coverImageUrl = pinVideoCoverUrl(src.processedPhotoUrls, videoUrl)
      return await publishPinterestVideo({ accessToken, videoUrl, coverImageUrl, settings, caption: src.caption })
    }
    if (!imageUrl) return { success: false, error: 'Pinterest needs an image from your uploads or Library' }
    const pinId = await createPinFromSettings(accessToken, settings, src.caption, { kind: 'image', imageUrl })
    return { success: true, postId: pinId }
  } catch (err) {
    console.error('[Pinterest] Publish failed', { postId: src.postId, err })
    return { success: false, error: err instanceof Error ? err.message : 'Pinterest publish failed' }
  }
}
