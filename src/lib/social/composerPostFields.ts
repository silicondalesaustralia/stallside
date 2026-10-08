import { isProxyableStorageUrl } from '@/lib/social/tiktok/tiktokMediaUrl'
import { sanitizeTikTokSettings } from '@/lib/social/tiktok/tiktokSettings'
import { TIKTOK_MAX_PHOTO_SLIDES } from '@/lib/social/tiktokSlides/slideTypes'

/** processedPhotoUrls.tiktok: null when absent, 'invalid' when present but unusable. */
function tiktokSlidesFromBody(processed: unknown): string[] | null | 'invalid' {
  if (!processed || typeof processed !== 'object' || Array.isArray(processed)) return null
  const slides = (processed as Record<string, unknown>).tiktok
  if (slides === undefined) return null
  if (!Array.isArray(slides) || !slides.length || slides.length > TIKTOK_MAX_PHOTO_SLIDES) return 'invalid'
  return slides.every((s) => typeof s === 'string' && isProxyableStorageUrl(s)) ? (slides as string[]) : 'invalid'
}

/**
 * Create-composer fields on POST /api/social/posts: TikTok settings + video.
 * Returns columns to merge into the insert, or an error message.
 */
export function composerPostColumns(body: {
  platforms?: unknown
  publishingMode?: unknown
  tiktokSettings?: unknown
  mediaType?: unknown
  videoUrl?: unknown
  videoDurationSeconds?: unknown
  processedPhotoUrls?: unknown
}): { ok: true; columns: Record<string, unknown> } | { ok: false; message: string } {
  const columns: Record<string, unknown> = {}
  const platforms = Array.isArray(body.platforms) ? body.platforms : []

  if (platforms.includes('tiktok')) {
    const settings = sanitizeTikTokSettings(body.tiktokSettings)
    if (settings) {
      columns.tiktok_settings = settings
    } else if (body.publishingMode !== 'manual') {
      return { ok: false, message: 'Choose TikTok privacy settings before posting to TikTok.' }
    }
  }

  const tiktokSlides = tiktokSlidesFromBody(body.processedPhotoUrls)
  if (tiktokSlides === 'invalid') {
    return { ok: false, message: `TikTok slides must be 1-${TIKTOK_MAX_PHOTO_SLIDES} images from your uploads or Library.` }
  }

  if (body.mediaType === 'video') {
    if (typeof body.videoUrl !== 'string' || !isProxyableStorageUrl(body.videoUrl)) {
      return { ok: false, message: 'Video must come from your Library.' }
    }
    if (body.publishingMode !== 'manual' && platforms.some((p) => p !== 'tiktok')) {
      return { ok: false, message: 'Videos can only be posted automatically to TikTok for now.' }
    }
    columns.media_type = 'video'
    columns.video_url = body.videoUrl
    const duration = Number(body.videoDurationSeconds)
    columns.video_duration_seconds = Number.isFinite(duration) && duration > 0 ? duration : null
  }

  return { ok: true, columns }
}
