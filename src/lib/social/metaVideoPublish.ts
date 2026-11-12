// ============================================================
// lib/social/metaVideoPublish.ts
// Publish video posts to a Facebook Page and as an Instagram Reel.
// Meta fetches the MP4 from videoUrl, so it must be publicly reachable.
// ============================================================

import { graphPost } from '@/lib/social/metaGraphClient'
import { fitInstagramCaption } from '@/lib/social/instagramCaption'
import { waitForInstagramContainer, type MetaPublishResult } from '@/lib/social/metaPublish'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

/** Reels processing is slower than images: poll every 2s for up to ~3 minutes. */
const REEL_STATUS_ATTEMPTS = 90

export async function postVideoToFacebook(
  pageId: string,
  pageAccessToken: string,
  videoUrl: string,
  caption: string,
): Promise<MetaPublishResult> {
  if (DEMO || !pageAccessToken) {
    console.log('[Demo] Would post video to Facebook page:', pageId)
    return { success: true, postId: `demo-fb-${Date.now()}`, demo: true }
  }

  const result = await graphPost<{ id?: string }>(`${pageId}/videos`, {
    file_url: videoUrl,
    description: caption,
    access_token: pageAccessToken,
  })
  if (!result.ok) {
    console.error('[Meta][facebook] Video publish failed', { pageId, error: result.error })
    return { success: false, error: result.error }
  }
  return { success: true, postId: result.data.id }
}

export async function postReelToInstagram(
  igAccountId: string,
  accessToken: string,
  videoUrl: string,
  caption: string,
): Promise<MetaPublishResult> {
  if (DEMO || !accessToken) {
    console.log('[Demo] Would post Reel to Instagram account:', igAccountId)
    return { success: true, postId: `demo-ig-${Date.now()}`, demo: true }
  }

  const container = await graphPost<{ id: string }>(`${igAccountId}/media`, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption: fitInstagramCaption(caption),
    share_to_feed: 'true',
    access_token: accessToken,
  })
  if (!container.ok) {
    console.error('[Meta][instagram] Reel container create failed', { igAccountId, error: container.error })
    return { success: false, error: container.error }
  }

  const ready = await waitForInstagramContainer(container.data.id, accessToken, {
    maxAttempts: REEL_STATUS_ATTEMPTS,
    kind: 'video',
  })
  if (!ready.ok) {
    console.error('[Meta][instagram] Reel not ready', { igAccountId, error: ready.error })
    return { success: false, error: ready.error }
  }

  const published = await graphPost<{ id: string }>(`${igAccountId}/media_publish`, {
    creation_id: container.data.id,
    access_token: accessToken,
  })
  if (!published.ok) {
    console.error('[Meta][instagram] Reel publish failed', { igAccountId, error: published.error })
    return { success: false, error: published.error }
  }
  return { success: true, postId: published.data.id }
}
