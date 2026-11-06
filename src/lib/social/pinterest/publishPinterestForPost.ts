import { getPinterestAccessToken } from '@/lib/social/pinterest/pinterestAuth'
import { createPinFromSettings } from '@/lib/social/pinterest/pinterestApi'
import { sanitizePinterestSettings } from '@/lib/social/pinterest/pinterestSettings'
import { publishPinterestVideo } from '@/lib/social/pinterest/pinterestVideoPublish'
import { pinImageUrl, resolvePinterestVideoCover } from '@/lib/social/pinterest/pinterestVideoCover'
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
    ...(result.success && result.mediaId && !result.postId ? { pinterest_media_id: result.mediaId } : {}),
  }
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
      const cover = await resolvePinterestVideoCover(src.processedPhotoUrls, videoUrl)
      return await publishPinterestVideo({ accessToken, videoUrl, cover, settings, caption: src.caption })
    }
    if (!imageUrl) return { success: false, error: 'Pinterest needs an image from your uploads or Library' }
    const pinId = await createPinFromSettings(accessToken, settings, src.caption, { kind: 'image', imageUrl })
    return { success: true, postId: pinId }
  } catch (err) {
    console.error('[Pinterest] Publish failed', { postId: src.postId, err })
    return { success: false, error: err instanceof Error ? err.message : 'Pinterest publish failed' }
  }
}
