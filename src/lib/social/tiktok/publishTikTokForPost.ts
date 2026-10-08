import { getTikTokAccessToken } from '@/lib/social/tiktok/tiktokAuth'
import { postToTikTok, type TikTokPublishResult } from '@/lib/social/tiktok/tiktokPublish'
import { tiktokSourcePhotoUrls } from '@/lib/social/tiktok/tiktokMediaUrl'
import { sanitizeTikTokSettings } from '@/lib/social/tiktok/tiktokSettings'

export type TikTokPostSource = {
  postId: string
  businessId: string
  caption: string
  tiktokSettings: unknown
  processedPhotoUrls: Record<string, string[]>
  mediaType: string | null
  videoUrl: string | null
  videoDurationSeconds: number | null
}

type SocialPostTikTokRow = {
  id: string
  tiktok_settings?: unknown
  media_type?: string | null
  video_url?: string | null
  video_duration_seconds?: number | string | null
}

export function tiktokPostSourceFromRow(
  row: SocialPostTikTokRow,
): Omit<TikTokPostSource, 'businessId' | 'caption' | 'processedPhotoUrls'> {
  const duration = Number(row.video_duration_seconds)
  return {
    postId: row.id,
    tiktokSettings: row.tiktok_settings ?? null,
    mediaType: row.media_type ?? null,
    videoUrl: row.video_url ?? null,
    videoDurationSeconds: Number.isFinite(duration) && duration > 0 ? duration : null,
  }
}

/** social_posts columns after a publish attempt ({} when TikTok was not targeted). */
export function tiktokResultColumns(result: TikTokPublishResult | undefined): Record<string, unknown> {
  if (!result) return {}
  return {
    tiktok_publish_id: result.publishId ?? null,
    tiktok_post_id: null,
    tiktok_error: result.success ? null : result.error ?? 'TikTok publish failed',
    tiktok_status: result.success ? 'PROCESSING_UPLOAD' : 'FAILED',
  }
}

/** Resolve token + media for one social_posts row and start the TikTok publish. */
export async function publishTikTokForPost(src: TikTokPostSource): Promise<TikTokPublishResult> {
  let accessToken: string | null
  try {
    accessToken = await getTikTokAccessToken(src.businessId)
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'TikTok token refresh failed' }
  }
  if (!accessToken) return { success: false, error: 'TikTok is not connected' }

  const video =
    src.mediaType === 'video' && src.videoUrl
      ? { url: src.videoUrl, durationSeconds: src.videoDurationSeconds }
      : null

  return postToTikTok({
    accessToken,
    postId: src.postId,
    caption: src.caption,
    settings: sanitizeTikTokSettings(src.tiktokSettings),
    photoCount: video ? 0 : tiktokSourcePhotoUrls(src.processedPhotoUrls).length,
    video,
  })
}
