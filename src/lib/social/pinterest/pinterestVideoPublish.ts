import { createPinFromSettings, type PinVideoCover } from '@/lib/social/pinterest/pinterestApi'
import type { PinterestPostSettings } from '@/lib/social/pinterest/pinterestSettings'
import {
  registerPinterestVideo,
  uploadPinterestVideoBytes,
  waitForPinterestMedia,
} from '@/lib/social/pinterest/pinterestVideoUpload'
import { downloadVideo } from '@/lib/social/tiktok/tiktokVideoUpload'

/** Kept short: publishPost runs platforms one after another inside the route's 60s limit. */
const WAIT_BUDGET_MS = 20_000

export type PinterestVideoPublishResult =
  | { success: true; mediaId: string; postId?: string }
  | { success: false; error: string }

/** Upload the video and create the Pin, or leave mediaId pending for syncPendingPinterestPosts. */
export async function publishPinterestVideo(input: {
  accessToken: string
  videoUrl: string
  cover: PinVideoCover | null
  settings: PinterestPostSettings
  caption: string
}): Promise<PinterestVideoPublishResult> {
  const { accessToken, settings, caption, cover } = input
  const { bytes, mimeType } = await downloadVideo(input.videoUrl)
  const registration = await registerPinterestVideo(accessToken)
  await uploadPinterestVideoBytes(registration, bytes, mimeType)
  const mediaId = registration.media_id
  const status = await waitForPinterestMedia(accessToken, mediaId, WAIT_BUDGET_MS)
  const coverLabel = !cover ? 'first frame' : 'url' in cover ? cover.url : 'inline jpeg'
  console.info('[Pinterest] Video media', { mediaId, status, cover: coverLabel })
  if (status === 'failed') return { success: false, error: 'Pinterest could not process this video' }
  if (status !== 'succeeded') return { success: true, mediaId }
  const postId = await createPinFromSettings(accessToken, settings, caption, { kind: 'video', mediaId, cover })
  return { success: true, mediaId, postId }
}
