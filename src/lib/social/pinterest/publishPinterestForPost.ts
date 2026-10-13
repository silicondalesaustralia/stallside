import { getPinterestAccessToken } from '@/lib/social/pinterest/pinterestAuth'
import { createPinterestPin } from '@/lib/social/pinterest/pinterestApi'
import {
  PINTEREST_ALT_TEXT_MAX,
  cleanPinterestDescription,
  sanitizePinterestSettings,
} from '@/lib/social/pinterest/pinterestSettings'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

export type PinterestPublishResult = {
  success: boolean
  postId?: string
  error?: string
  demo?: boolean
}

export type PinterestPostSource = {
  postId: string
  businessId: string
  caption: string
  pinterestSettings: unknown
  mediaType: string | null
  processedPhotoUrls: Record<string, string[]>
}

type SocialPostPinterestRow = {
  id: string
  pinterest_settings?: unknown
  media_type?: string | null
}

export function pinterestPostSourceFromRow(
  row: SocialPostPinterestRow,
): Omit<PinterestPostSource, 'businessId' | 'caption' | 'processedPhotoUrls'> {
  return {
    postId: row.id,
    pinterestSettings: row.pinterest_settings ?? null,
    mediaType: row.media_type ?? null,
  }
}

/** social_posts columns after a publish attempt ({} when Pinterest was not targeted). */
export function pinterestResultColumns(result: PinterestPublishResult | undefined): Record<string, unknown> {
  if (!result) return {}
  return {
    pinterest_post_id: result.success ? result.postId ?? null : null,
    pinterest_error: result.success ? null : result.error ?? 'Pinterest publish failed',
  }
}

function pinImageUrl(processed: Record<string, string[]>): string | null {
  const url = processed.pinterest?.[0] ?? processed.instagram_square?.[0] ?? processed.facebook?.[0]
  return url && /^https:\/\//.test(url) ? url : null
}

/** Resolve token + image for one social_posts row and create the Pin. */
export async function publishPinterestForPost(src: PinterestPostSource): Promise<PinterestPublishResult> {
  const settings = sanitizePinterestSettings(src.pinterestSettings)
  if (!settings) return { success: false, error: 'Pick a Pinterest board before posting' }
  if (src.mediaType === 'video') return { success: false, error: 'Pinterest posts need an image' }
  const imageUrl = pinImageUrl(src.processedPhotoUrls)
  if (!imageUrl) return { success: false, error: 'Pinterest needs an image from your uploads or Library' }
  if (DEMO) {
    console.log('[Demo] Would create Pinterest Pin:', src.postId)
    return { success: true, postId: `demo-pin-${Date.now()}`, demo: true }
  }

  try {
    const accessToken = await getPinterestAccessToken(src.businessId)
    if (!accessToken) return { success: false, error: 'Pinterest is not connected' }
    const pinId = await createPinterestPin(accessToken, {
      boardId: settings.boardId,
      title: settings.title,
      description: cleanPinterestDescription(src.caption),
      link: settings.link,
      imageUrl,
      altText: settings.title.slice(0, PINTEREST_ALT_TEXT_MAX),
    })
    return { success: true, postId: pinId }
  } catch (err) {
    console.error('[Pinterest] Publish failed', { postId: src.postId, err })
    return { success: false, error: err instanceof Error ? err.message : 'Pinterest publish failed' }
  }
}
