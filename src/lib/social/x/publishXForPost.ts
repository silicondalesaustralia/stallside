import { getXAccessToken } from '@/lib/social/x/xAuth'
import { createXPost, uploadXImage } from '@/lib/social/x/xApi'
import { xTextBlockReason } from '@/lib/social/x/xText'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

export type XPublishResult = {
  success: boolean
  postId?: string
  error?: string
  demo?: boolean
}

export type XPostSource = {
  postId: string
  businessId: string
  /** platform_captions.x when set, else the shared caption. */
  text: string
  mediaType: string | null
  processedPhotoUrls: Record<string, string[]>
}

/** social_posts columns after a publish attempt ({} when X was not targeted). */
export function xResultColumns(result: XPublishResult | undefined): Record<string, unknown> {
  if (!result) return {}
  return {
    x_post_id: result.success ? result.postId ?? null : null,
    x_error: result.success ? null : result.error ?? 'X publish failed',
  }
}

function postImageUrl(processed: Record<string, string[]>): string | null {
  const url = processed.x?.[0] ?? processed.facebook?.[0] ?? processed.instagram_square?.[0]
  return url && /^https:\/\//.test(url) ? url : null
}

/** Upload the post image and create the X post. */
export async function publishXForPost(src: XPostSource): Promise<XPublishResult> {
  const textProblem = xTextBlockReason(src.text)
  if (textProblem) return { success: false, error: textProblem }
  if (src.mediaType === 'video') return { success: false, error: 'Video posts to X are not supported yet' }
  const imageUrl = postImageUrl(src.processedPhotoUrls)
  if (DEMO) {
    console.log('[Demo] Would post to X:', src.postId)
    return { success: true, postId: `demo-x-${Date.now()}`, demo: true }
  }

  try {
    const accessToken = await getXAccessToken(src.businessId)
    if (!accessToken) return { success: false, error: 'X is not connected' }
    const mediaId = imageUrl ? await uploadXImage(accessToken, imageUrl) : null
    const postId = await createXPost(accessToken, { text: src.text.trim(), mediaId })
    return { success: true, postId }
  } catch (err) {
    console.error('[X] Publish failed', { postId: src.postId, err })
    return { success: false, error: err instanceof Error ? err.message : 'X publish failed' }
  }
}
