import { readFile } from 'node:fs/promises'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClipMoment } from '../../../src/lib/social/videoClips/types'
import type { CaptionsDoc } from '../../../src/lib/social/videoClips/captionCues'
import { buildClipCleanPath } from '../../../src/lib/social/videoClips/limits'
import {
  buildSocialVideoOriginalPath,
  buildSocialVideoThumbnailPath,
  publicSocialPostsUrl,
} from '../../../src/lib/social/socialVideoStorage'
import { SOCIAL_VIDEO_BUCKET } from './supabase'

export async function uploadFile(
  db: SupabaseClient,
  path: string,
  filePath: string,
  contentType: string,
): Promise<number> {
  const body = await readFile(filePath)
  const { error } = await db.storage
    .from(SOCIAL_VIDEO_BUCKET)
    .upload(path, body, { contentType, upsert: false })
  if (error) throw new Error(`clip_upload_failed: ${error.message}`)
  return body.length
}

export type SaveClipInput = {
  clipId: string
  businessId: string
  jobId: string | null
  sourceId: string
  clipJobId: string
  moment: ClipMoment
  aboutText: string | null
  /** File to publish (captioned when captions are on). */
  clipPath: string
  /** Caption-free file kept for caption re-renders. */
  cleanClipPath: string
  thumbPath: string | null
  captions: Omit<CaptionsDoc, 'cleanPath'>
}

/** Upload clip + clean copy + thumbnail and insert a ready Library asset. */
export async function saveClipToLibrary(db: SupabaseClient, input: SaveClipInput): Promise<void> {
  const videoPath = buildSocialVideoOriginalPath(input.businessId, input.clipId, 'video/mp4')
  const size = await uploadFile(db, videoPath, input.clipPath, 'video/mp4')

  let cleanPath = videoPath
  if (input.cleanClipPath !== input.clipPath) {
    cleanPath = buildClipCleanPath(input.businessId, input.clipId)
    await uploadFile(db, cleanPath, input.cleanClipPath, 'video/mp4')
  }

  let thumbnailPath: string | null = null
  if (input.thumbPath) {
    thumbnailPath = buildSocialVideoThumbnailPath(input.businessId, input.clipId)
    await uploadFile(db, thumbnailPath, input.thumbPath, 'image/webp')
  }

  const originalUrl = publicSocialPostsUrl(videoPath)
  if (!originalUrl) throw new Error('clip_public_url_failed')

  const { moment } = input
  const about = [moment.title, input.aboutText].filter(Boolean).join('. ').slice(0, 2000)
  const { error } = await db.from('social_media_assets').insert({
    id: input.clipId,
    business_id: input.businessId,
    job_id: input.jobId,
    media_type: 'video',
    status: 'ready',
    storage_path: videoPath,
    original_url: originalUrl,
    thumbnail_path: thumbnailPath,
    thumbnail_url: thumbnailPath ? publicSocialPostsUrl(thumbnailPath) || null : null,
    duration_seconds: Math.round((moment.end - moment.start) * 100) / 100,
    mime_type: 'video/mp4',
    file_size_bytes: size,
    about_text: about || null,
    source_video_id: input.sourceId,
    clip_job_id: input.clipJobId,
    clip_start_seconds: moment.start,
    clip_end_seconds: moment.end,
    clip_title: moment.title || null,
    clip_score: moment.score,
    captions: { ...input.captions, cleanPath },
  })
  if (error) throw new Error(`clip_asset_insert_failed: ${error.message}`)
}
