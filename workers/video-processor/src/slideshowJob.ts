import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { runFfmpeg } from '../../../src/lib/social/videoBranding/runFfmpeg'
import { buildSocialVideoOriginalPath, publicSocialPostsUrl } from '../../../src/lib/social/socialVideoStorage'
import {
  slideshowDurationSeconds,
  slideshowFfmpegArgs,
} from '../../../src/lib/social/slideshow/slideshowFfmpegArgs'
import type { SlideshowTransition } from '../../../src/lib/social/slideshow/slideshowTypes'
import { uploadFile } from './clipJobStorage'
import { SOCIAL_VIDEO_BUCKET } from './supabase'

const TABLE = 'social_slideshow_jobs'
const SLIDESHOW_FFMPEG_TIMEOUT_MS = 5 * 60 * 1000

export type SlideshowJobRow = {
  id: string
  business_id: string
  job_id: string | null
  slide_paths: string[]
  seconds_per_slide: number
  transition: SlideshowTransition
  about_text: string | null
}

async function updateJob(db: SupabaseClient, id: string, patch: Record<string, string | null>): Promise<void> {
  const { error } = await db.from(TABLE).update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) console.error('[Slideshow] job update failed', { id, error: error.message })
}

export async function claimNextSlideshowJob(db: SupabaseClient, workerId: string): Promise<SlideshowJobRow | null> {
  const { data: pending, error } = await db
    .from(TABLE)
    .select('id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) {
    if (!/does not exist|schema cache/i.test(error.message)) console.error('[Slideshow] claim lookup failed', error.message)
    return null
  }
  if (!pending) return null
  const now = new Date().toISOString()
  const { data: claimed, error: claimErr } = await db
    .from(TABLE)
    .update({ status: 'processing', claimed_at: now, worker_id: workerId, updated_at: now })
    .eq('id', pending.id)
    .eq('status', 'pending')
    .select('id, business_id, job_id, slide_paths, seconds_per_slide, transition, about_text')
    .maybeSingle()
  if (claimErr || !claimed) return null
  return { ...claimed, seconds_per_slide: Number(claimed.seconds_per_slide) } as SlideshowJobRow
}

async function downloadSlide(db: SupabaseClient, path: string, dest: string): Promise<void> {
  const { data, error } = await db.storage.from(SOCIAL_VIDEO_BUCKET).download(path)
  if (error || !data) throw new Error(`slide_download_failed: ${error?.message ?? path}`)
  await writeFile(dest, Buffer.from(await data.arrayBuffer()))
}

export async function processSlideshowJob(db: SupabaseClient, job: SlideshowJobRow): Promise<void> {
  const workDir = join(tmpdir(), `slideshow-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })
  try {
    const imagePaths = job.slide_paths.map((_, i) => join(workDir, `slide-${i + 1}.jpg`))
    await Promise.all(job.slide_paths.map((path, i) => downloadSlide(db, path, imagePaths[i])))

    const outputPath = join(workDir, 'slideshow.mp4')
    const args = slideshowFfmpegArgs({
      imagePaths,
      outputPath,
      secondsPerSlide: job.seconds_per_slide,
      transition: job.transition,
    })
    await runFfmpeg(args, SLIDESHOW_FFMPEG_TIMEOUT_MS)

    const assetId = randomUUID()
    const videoPath = buildSocialVideoOriginalPath(job.business_id, assetId, 'video/mp4')
    const size = await uploadFile(db, videoPath, outputPath, 'video/mp4')
    const originalUrl = publicSocialPostsUrl(videoPath)
    if (!originalUrl) throw new Error('slideshow_public_url_failed')
    const thumbnailPath = job.slide_paths[0]

    const { error } = await db.from('social_media_assets').insert({
      id: assetId,
      business_id: job.business_id,
      job_id: job.job_id,
      media_type: 'video',
      status: 'ready',
      storage_path: videoPath,
      original_url: originalUrl,
      thumbnail_path: thumbnailPath,
      thumbnail_url: publicSocialPostsUrl(thumbnailPath) || null,
      duration_seconds: slideshowDurationSeconds(job.slide_paths.length, job.seconds_per_slide),
      mime_type: 'video/mp4',
      file_size_bytes: size,
      about_text: job.about_text,
    })
    if (error) throw new Error(`slideshow_asset_insert_failed: ${error.message}`)

    await updateJob(db, job.id, { status: 'completed', asset_id: assetId, completed_at: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'slideshow_failed'
    console.error('[Slideshow] job failed', { id: job.id, error: message })
    await updateJob(db, job.id, {
      status: 'failed',
      error_message: 'The video could not be made - try Create slides again.',
      completed_at: new Date().toISOString(),
    })
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

/** Slideshows take seconds; anything still processing after 15 minutes was cut off by a restart. */
export async function recoverStaleSlideshowJobs(db: SupabaseClient, now = Date.now()): Promise<number> {
  const cutoff = new Date(now - 15 * 60 * 1000).toISOString()
  const nowIso = new Date(now).toISOString()
  const { data, error } = await db
    .from(TABLE)
    .update({
      status: 'failed',
      error_message: 'The video could not be made - try Create slides again.',
      completed_at: nowIso,
      updated_at: nowIso,
    })
    .eq('status', 'processing')
    .lt('claimed_at', cutoff)
    .select('id')
  if (error) {
    if (!/does not exist|schema cache/i.test(error.message)) console.error('[Slideshow] stale recovery failed', error.message)
    return 0
  }
  return data?.length ?? 0
}
