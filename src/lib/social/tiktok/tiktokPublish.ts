// ============================================================
// lib/social/tiktok/tiktokPublish.ts
// Content Posting API - Direct Post for photos and videos.
// Publishing is async: we return a publish_id and the status
// is resolved later by syncPendingTikTokPosts().
// ============================================================

import { TikTokApiError, tiktokPost } from '@/lib/social/tiktok/tiktokApi'
import { queryTikTokCreatorInfo } from '@/lib/social/tiktok/tiktokCreatorInfo'
import { tiktokPhotoProxyUrl } from '@/lib/social/tiktok/tiktokMediaUrl'
import {
  TIKTOK_CAPTION_MAX,
  tiktokPhotoTitle,
  type TikTokPostSettings,
} from '@/lib/social/tiktok/tiktokSettings'
import { downloadVideo, planTikTokChunks, uploadTikTokChunks } from '@/lib/social/tiktok/tiktokVideoUpload'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

export interface TikTokPublishResult {
  success: boolean
  publishId?: string
  error?: string
  demo?: boolean
}

export type TikTokPublishInput = {
  accessToken: string
  postId: string
  caption: string
  settings: TikTokPostSettings | null
  photoCount: number
  video: { url: string; durationSeconds: number | null } | null
}

function commonPostInfo(settings: TikTokPostSettings) {
  return {
    privacy_level: settings.privacyLevel,
    disable_comment: settings.disableComment,
    brand_organic_toggle: settings.brandOrganic,
    brand_content_toggle: settings.brandedContent,
  }
}

async function initPhotoPost(input: TikTokPublishInput, settings: TikTokPostSettings): Promise<string> {
  const photoImages = Array.from({ length: Math.min(input.photoCount, 35) }, (_, i) =>
    tiktokPhotoProxyUrl(input.postId, i),
  )
  const data = await tiktokPost<{ publish_id: string }>('/post/publish/content/init/', input.accessToken, {
    post_info: {
      ...commonPostInfo(settings),
      title: tiktokPhotoTitle(input.caption),
      description: input.caption.slice(0, 4000),
      auto_add_music: settings.autoAddMusic,
    },
    source_info: { source: 'PULL_FROM_URL', photo_cover_index: 0, photo_images: photoImages },
    post_mode: 'DIRECT_POST',
    media_type: 'PHOTO',
  })
  return data.publish_id
}

async function initVideoPost(
  input: TikTokPublishInput,
  settings: TikTokPostSettings,
  videoUrl: string,
): Promise<string> {
  const { bytes, mimeType } = await downloadVideo(videoUrl)
  const plan = planTikTokChunks(bytes.byteLength)
  const data = await tiktokPost<{ publish_id: string; upload_url: string }>(
    '/post/publish/video/init/',
    input.accessToken,
    {
      post_info: {
        ...commonPostInfo(settings),
        title: input.caption.slice(0, TIKTOK_CAPTION_MAX),
        disable_duet: settings.disableDuet,
        disable_stitch: settings.disableStitch,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: plan.videoSize,
        chunk_size: plan.chunkSize,
        total_chunk_count: plan.totalChunkCount,
      },
    },
  )
  await uploadTikTokChunks(data.upload_url, bytes, mimeType, plan)
  return data.publish_id
}

export async function postToTikTok(input: TikTokPublishInput): Promise<TikTokPublishResult> {
  if (!input.settings) {
    return { success: false, error: 'TikTok privacy settings missing - edit the post in Create and choose who can see it.' }
  }
  if (DEMO || !input.accessToken) {
    console.log('[Demo] Would post to TikTok:', input.postId)
    return { success: true, publishId: `demo-tiktok-${Date.now()}`, demo: true }
  }
  if (!input.video && input.photoCount === 0) {
    return { success: false, error: 'TikTok post needs a photo or video' }
  }
  try {
    const creator = await queryTikTokCreatorInfo(input.accessToken)
    if (!creator.privacyLevelOptions.includes(input.settings.privacyLevel)) {
      return {
        success: false,
        error: 'Your TikTok account settings changed, so this privacy choice is no longer allowed. Tap Duplicate, choose who can see it, and post again.',
      }
    }
    const duration = input.video?.durationSeconds
    if (duration && duration > creator.maxVideoPostDurationSec) {
      return { success: false, error: `Video is longer than TikTok allows for this account (${creator.maxVideoPostDurationSec}s).` }
    }
    const publishId = input.video
      ? await initVideoPost(input, input.settings, input.video.url)
      : await initPhotoPost(input, input.settings)
    return { success: true, publishId }
  } catch (err) {
    console.error('[TikTok] Publish failed', { postId: input.postId, err })
    if (err instanceof TikTokApiError && err.code === 'unaudited_client_can_only_post_to_private_accounts') {
      return {
        success: false,
        error:
          'TikTok only allows private posts until our app is approved. Set your TikTok account to Private and choose "Only me", then try again.',
      }
    }
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
