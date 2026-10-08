// ============================================================
// lib/social/metaPublish.ts
// Publish photo posts to a Facebook Page and Instagram account.
// In SOCIAL_DEMO_MODE, simulates success without calling Meta.
// ============================================================

import { graphGet, graphPost } from '@/lib/social/metaGraphClient'
import { fitInstagramCaption } from '@/lib/social/instagramCaption'
import { ensureInstagramJpegUrl } from '@/lib/social/instagramJpeg'

export interface MetaPublishResult {
  success: boolean
  postId?: string
  error?: string
  demo?: boolean
}

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

export async function postToFacebook(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string,
  caption: string,
): Promise<MetaPublishResult> {
  if (DEMO || !pageAccessToken) {
    console.log('[Demo] Would post to Facebook page:', pageId)
    return { success: true, postId: `demo-fb-${Date.now()}`, demo: true }
  }

  const result = await graphPost<{ id?: string; post_id?: string }>(`${pageId}/photos`, {
    url: imageUrl,
    caption,
    access_token: pageAccessToken,
  })
  if (!result.ok) {
    console.error('[Meta][facebook] Publish failed', { pageId, error: result.error })
    return { success: false, error: result.error }
  }
  return { success: true, postId: result.data.post_id || result.data.id }
}

export async function postToInstagram(
  igAccountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string,
  businessId: string,
): Promise<MetaPublishResult> {
  if (DEMO || !accessToken) {
    console.log('[Demo] Would post to Instagram account:', igAccountId)
    return { success: true, postId: `demo-ig-${Date.now()}`, demo: true }
  }

  let jpegUrl: string
  try {
    jpegUrl = await ensureInstagramJpegUrl(imageUrl, businessId)
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[Meta][instagram] JPEG conversion failed', { igAccountId, imageUrl, error })
    return { success: false, error }
  }

  const container = await graphPost<{ id: string }>(`${igAccountId}/media`, {
    image_url: jpegUrl,
    caption: fitInstagramCaption(caption),
    access_token: accessToken,
  })
  if (!container.ok) {
    console.error('[Meta][instagram] Container create failed', { igAccountId, error: container.error })
    return { success: false, error: container.error }
  }

  const ready = await waitForInstagramContainer(container.data.id, accessToken)
  if (!ready.ok) {
    console.error('[Meta][instagram] Container not ready', { igAccountId, error: ready.error })
    return { success: false, error: ready.error }
  }

  const published = await graphPost<{ id: string }>(`${igAccountId}/media_publish`, {
    creation_id: container.data.id,
    access_token: accessToken,
  })
  if (!published.ok) {
    console.error('[Meta][instagram] Publish failed', { igAccountId, error: published.error })
    return { success: false, error: published.error }
  }
  return { success: true, postId: published.data.id }
}

/** media_publish fails with "Media ID is not available" until the container is FINISHED. */
async function waitForInstagramContainer(
  containerId: string,
  accessToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const maxAttempts = 15
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { status_code } = await graphGet<{ status_code?: string }>(containerId, {
        fields: 'status_code',
        access_token: accessToken,
      })
      if (status_code === 'FINISHED') return { ok: true }
      if (status_code === 'ERROR' || status_code === 'EXPIRED') {
        return { ok: false, error: `Instagram could not process the image (${status_code})` }
      }
    } catch (err) {
      console.warn('[Meta][instagram] Container status check failed', {
        containerId,
        error: err instanceof Error ? err.message : String(err),
      })
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  return { ok: false, error: 'Instagram is still processing the image - please retry in a minute' }
}
