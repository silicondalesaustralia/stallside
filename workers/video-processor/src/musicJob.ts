import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { parseMusicChoice } from '../../../src/lib/social/music/musicCatalog'
import { buildSocialVideoOriginalPath, publicSocialPostsUrl } from '../../../src/lib/social/socialVideoStorage'
import { probeVideoDisplay } from '../../../src/lib/social/videoBranding/processBrandingLocally'
import { uploadFile } from './clipJobStorage'
import { mixMusicIntoVideo } from './musicMix'

const TABLE = 'social_music_jobs'
const FAILED_MESSAGE = 'The music could not be added - try again.'

export type MusicJobRow = {
  id: string
  business_id: string
  source_url: string
  source_asset_id: string | null
  music: unknown
}

async function updateJob(db: SupabaseClient, id: string, patch: Record<string, string | null>): Promise<void> {
  const { error } = await db.from(TABLE).update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) console.error('[Music] job update failed', { id, error: error.message })
}

export async function claimNextMusicJob(db: SupabaseClient, workerId: string): Promise<MusicJobRow | null> {
  const { data: pending, error } = await db
    .from(TABLE)
    .select('id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) {
    if (!/does not exist|schema cache/i.test(error.message)) console.error('[Music] claim lookup failed', error.message)
    return null
  }
  if (!pending) return null
  const now = new Date().toISOString()
  const { data: claimed, error: claimErr } = await db
    .from(TABLE)
    .update({ status: 'processing', claimed_at: now, worker_id: workerId, updated_at: now })
    .eq('id', pending.id)
    .eq('status', 'pending')
    .select('id, business_id, source_url, source_asset_id, music')
    .maybeSingle()
  if (claimErr || !claimed) return null
  return claimed as MusicJobRow
}

/** Source asset fields copied to the new Library video so it stays linked to the same item. */
async function sourceDetails(db: SupabaseClient, job: MusicJobRow) {
  if (!job.source_asset_id) return null
  const { data, error } = await db
    .from('social_media_assets')
    .select('job_id, about_text, thumbnail_path, thumbnail_url')
    .eq('id', job.source_asset_id)
    .eq('business_id', job.business_id)
    .maybeSingle()
  if (error) console.warn('[Music] source asset lookup failed', error.message)
  return data
}

export async function processMusicJob(db: SupabaseClient, job: MusicJobRow): Promise<void> {
  const workDir = join(tmpdir(), `music-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })
  try {
    const music = parseMusicChoice(job.music)
    if (!music) throw new Error('music_track_unknown')
    const res = await fetch(job.source_url)
    if (!res.ok) throw new Error(`music_source_download_failed ${res.status}`)
    const sourcePath = join(workDir, 'source.mp4')
    await writeFile(sourcePath, Buffer.from(await res.arrayBuffer()))

    const outputPath = await mixMusicIntoVideo({ videoPath: sourcePath, music, workDir })
    const probe = await probeVideoDisplay(outputPath)
    const assetId = randomUUID()
    const videoPath = buildSocialVideoOriginalPath(job.business_id, assetId, 'video/mp4')
    const size = await uploadFile(db, videoPath, outputPath, 'video/mp4')
    const originalUrl = publicSocialPostsUrl(videoPath)
    if (!originalUrl) throw new Error('music_public_url_failed')
    const source = await sourceDetails(db, job)

    const { error } = await db.from('social_media_assets').insert({
      id: assetId,
      business_id: job.business_id,
      job_id: source?.job_id ?? null,
      media_type: 'video',
      status: 'ready',
      storage_path: videoPath,
      original_url: originalUrl,
      thumbnail_path: source?.thumbnail_path ?? null,
      thumbnail_url: source?.thumbnail_url ?? null,
      duration_seconds: probe.duration ?? null,
      mime_type: 'video/mp4',
      file_size_bytes: size,
      about_text: source?.about_text ?? null,
    })
    if (error) throw new Error(`music_asset_insert_failed: ${error.message}`)
    await updateJob(db, job.id, { status: 'completed', asset_id: assetId, completed_at: new Date().toISOString() })
  } catch (err) {
    console.error('[Music] job failed', { id: job.id, error: err instanceof Error ? err.message : err })
    await updateJob(db, job.id, { status: 'failed', error_message: FAILED_MESSAGE, completed_at: new Date().toISOString() })
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

/** Music jobs take seconds; anything still processing after 15 minutes was cut off by a restart. */
export async function recoverStaleMusicJobs(db: SupabaseClient, now = Date.now()): Promise<number> {
  const nowIso = new Date(now).toISOString()
  const { data, error } = await db
    .from(TABLE)
    .update({ status: 'failed', error_message: FAILED_MESSAGE, completed_at: nowIso, updated_at: nowIso })
    .eq('status', 'processing')
    .lt('claimed_at', new Date(now - 15 * 60 * 1000).toISOString())
    .select('id')
  if (error) {
    if (!/does not exist|schema cache/i.test(error.message)) console.error('[Music] stale recovery failed', error.message)
    return 0
  }
  return data?.length ?? 0
}
