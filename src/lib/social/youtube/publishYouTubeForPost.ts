import { getYouTubeAccessToken } from '@/lib/social/youtube/youtubeAuth'
import { uploadYouTubeVideo } from '@/lib/social/youtube/youtubeUpload'
import { sanitizeYouTubeSettings } from '@/lib/social/youtube/youtubeSettings'
import { downloadVideo } from '@/lib/social/tiktok/tiktokVideoUpload'
import { isProxyableStorageUrl } from '@/lib/social/tiktok/tiktokMediaUrl'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

export type YouTubePublishResult = {
  success: boolean
  postId?: string
  error?: string
  demo?: boolean
}

export type YouTubePostSource = {
  postId: string
  businessId: string
  caption: string
  youtubeSettings: unknown
  mediaType: string | null
  videoUrl: string | null
}

type SocialPostYouTubeRow = {
  id: string
  youtube_settings?: unknown
  media_type?: string | null
  video_url?: string | null
}

export function youtubePostSourceFromRow(
  row: SocialPostYouTubeRow,
): Omit<YouTubePostSource, 'businessId' | 'caption'> {
  return {
    postId: row.id,
    youtubeSettings: row.youtube_settings ?? null,
    mediaType: row.media_type ?? null,
    videoUrl: row.video_url ?? null,
  }
}

/** social_posts columns after a publish attempt ({} when YouTube was not targeted). */
export function youtubeResultColumns(result: YouTubePublishResult | undefined): Record<string, unknown> {
  if (!result) return {}
  return {
    youtube_post_id: result.success ? result.postId ?? null : null,
    youtube_error: result.success ? null : result.error ?? 'YouTube publish failed',
  }
}

/** Resolve token + video for one social_posts row and upload it to YouTube. */
export async function publishYouTubeForPost(src: YouTubePostSource): Promise<YouTubePublishResult> {
  const settings = sanitizeYouTubeSettings(src.youtubeSettings)
  if (!settings) return { success: false, error: 'YouTube title and privacy are missing' }
  if (src.mediaType !== 'video' || !src.videoUrl) {
    return { success: false, error: 'YouTube needs a video' }
  }
  if (!isProxyableStorageUrl(src.videoUrl)) {
    return { success: false, error: 'Video must come from your Library' }
  }
  if (DEMO) {
    console.log('[Demo] Would upload to YouTube:', src.postId)
    return { success: true, postId: `demo-youtube-${Date.now()}`, demo: true }
  }

  try {
    const accessToken = await getYouTubeAccessToken(src.businessId)
    if (!accessToken) return { success: false, error: 'YouTube is not connected' }
    const { bytes, mimeType } = await downloadVideo(src.videoUrl)
    const videoId = await uploadYouTubeVideo({ accessToken, bytes, mimeType, settings, caption: src.caption })
    return { success: true, postId: videoId }
  } catch (err) {
    console.error('[YouTube] Publish failed', { postId: src.postId, err })
    return { success: false, error: err instanceof Error ? err.message : 'YouTube publish failed' }
  }
}
