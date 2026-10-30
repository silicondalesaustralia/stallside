import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CaptionJobRow } from '../../../src/lib/social/videoClips/types'
import { parseCaptionsDoc } from '../../../src/lib/social/videoClips/captionCues'
import { clipThumbnailArgs } from '../../../src/lib/social/videoClips/clipFfmpegArgs'
import { runFfmpeg } from '../../../src/lib/social/videoBranding/runFfmpeg'
import {
  buildSocialVideoOriginalPath,
  buildSocialVideoThumbnailPath,
  publicSocialPostsUrl,
} from '../../../src/lib/social/socialVideoStorage'
import { fetchBrandColor, renderCaptionedClip } from './captionRender'
import { uploadFile } from './clipJobStorage'

const TABLE = 'social_video_caption_jobs'

async function updateJob(db: SupabaseClient, id: string, patch: Record<string, string | null>) {
  const { error } = await db.from(TABLE).update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) console.error('[VideoCaptions] job update failed', { id, error: error.message })
}

export async function claimNextCaptionJob(db: SupabaseClient, workerId: string): Promise<CaptionJobRow | null> {
  const { data: pending, error } = await db
    .from(TABLE)
    .select('id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) {
    if (!/does not exist|schema cache/i.test(error.message)) {
      console.error('[VideoCaptions] claim lookup failed', error.message)
    }
    return null
  }
  if (!pending) return null
  const now = new Date().toISOString()
  const { data } = await db
    .from(TABLE)
    .update({ status: 'processing', claimed_at: now, worker_id: workerId, updated_at: now })
    .eq('id', pending.id)
    .eq('status', 'pending')
    .select('id, asset_id, business_id, status, claimed_at')
    .maybeSingle()
  return (data as CaptionJobRow | null) ?? null
}

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`clean_clip_download_failed ${res.status}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
}

export async function processCaptionJob(db: SupabaseClient, job: CaptionJobRow): Promise<void> {
  const workDir = join(tmpdir(), `su-caption-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })
  try {
    const { data: asset, error } = await db
      .from('social_media_assets')
      .select('id, business_id, storage_path, captions')
      .eq('id', job.asset_id)
      .single()
    if (error || !asset) throw new Error('caption_asset_missing')

    const doc = parseCaptionsDoc(asset.captions)
    const cleanPath = doc.cleanPath ?? asset.storage_path
    const cleanFile = join(workDir, 'clean.mp4')
    await downloadToFile(publicSocialPostsUrl(cleanPath), cleanFile)

    const brandColor = await fetchBrandColor(db, asset.business_id)
    const rendered = await renderCaptionedClip({ cleanPath: cleanFile, workDir, captions: doc, brandColor })
    const publishFile = rendered.path

    const version = `${asset.id}-${Date.now().toString(36)}`
    let videoPath = cleanPath
    let size: number | null = null
    if (publishFile !== cleanFile) {
      videoPath = buildSocialVideoOriginalPath(asset.business_id, version, 'video/mp4')
      size = await uploadFile(db, videoPath, publishFile, 'video/mp4')
    }

    const thumbFile = join(workDir, 'thumb.webp')
    const thumbPath = buildSocialVideoThumbnailPath(asset.business_id, version)
    const thumbOk = await runFfmpeg(clipThumbnailArgs(publishFile, thumbFile, 1))
      .then(() => uploadFile(db, thumbPath, thumbFile, 'image/webp'))
      .then(() => true)
      .catch((err: unknown) => {
        console.warn('[VideoCaptions] thumbnail failed', err instanceof Error ? err.message : err)
        return false
      })

    const { error: updateErr } = await db
      .from('social_media_assets')
      .update({
        storage_path: videoPath,
        original_url: publicSocialPostsUrl(videoPath),
        ...(size != null ? { file_size_bytes: size } : {}),
        duration_seconds: rendered.durationSeconds,
        ...(thumbOk ? { thumbnail_path: thumbPath, thumbnail_url: publicSocialPostsUrl(thumbPath) } : {}),
        captions: { ...doc, cleanPath },
      })
      .eq('id', asset.id)
    if (updateErr) throw new Error(`caption_asset_update_failed: ${updateErr.message}`)

    await updateJob(db, job.id, { status: 'completed', completed_at: new Date().toISOString(), error_message: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'caption_job_failed'
    console.error('[VideoCaptions] job failed', { jobId: job.id, error: message })
    await updateJob(db, job.id, { status: 'failed', error_message: message.slice(0, 500), completed_at: new Date().toISOString() })
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
