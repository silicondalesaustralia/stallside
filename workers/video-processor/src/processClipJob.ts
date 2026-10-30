import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClipJobRow, Transcript } from '../../../src/lib/social/videoClips/types'
import { transcribeWords, DEFAULT_CLIP_TRANSCRIBE_MODEL } from '../../../src/lib/social/videoClips/transcribeWords'
import { extractAudioArgs } from '../../../src/lib/social/videoClips/clipFfmpegArgs'
import { runFfmpeg } from '../../../src/lib/social/videoBranding/runFfmpeg'
import { probeVideoDisplay } from '../../../src/lib/social/videoBranding/processBrandingLocally'
import { recordVideoClipJobUsageEstimate } from '../../../src/lib/social/videoClips/recordVideoClipUsage'
import { downloadSourceToFile } from './sourceDownload'
import { updateClipJob } from './clipJobQueue'
import { fetchBrandColor } from './captionRender'
import { renderMomentClip, type MomentClipContext } from './renderMomentClip'
import { runWithConcurrency } from './runWithConcurrency'
import { selectClipJobMoments, type MomentSelection } from './clipJobMoments'

const EMPTY_TRANSCRIPT: Transcript = { text: '', segments: [], words: [] }

/** Clips rendered at once. Default 1 fits small (0.5 GB) instances; raise to 2–3 on 4 GB+ machines. */
const CLIP_CONCURRENCY = Math.min(4, Math.max(1, Number(process.env.VIDEO_CLIP_CONCURRENCY) || 1))

/** `betweenClips` runs after each clip so short jobs (editor saves) don't wait for the whole batch. */
export async function processClipJob(
  db: SupabaseClient,
  job: ClipJobRow,
  betweenClips: () => Promise<void> = async () => undefined,
): Promise<void> {
  const workDir = join(tmpdir(), `su-clip-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })
  let clipsCreated = 0
  const workerStartedAt = Date.now()
  let sourceBusinessId: string | null = null
  let sourceDurationSeconds = 0
  let renderedDurationSeconds = 0
  let momentSelection: MomentSelection | null = null
  const usageBase = (businessId: string) => ({
    businessId,
    jobId: job.id,
    sourceId: job.source_id,
    sourceDurationSeconds,
    momentSelection,
    clipCountRequested: job.clip_count,
    clipsCreated,
    renderedDurationSeconds,
    workerDurationMs: Date.now() - workerStartedAt,
  })

  try {
    const { data: source, error: sourceErr } = await db
      .from('social_video_sources')
      .select('id, business_id, job_id, status, storage_path, mime_type, title, about_text')
      .eq('id', job.source_id)
      .single()
    if (sourceErr || !source || source.status !== 'ready') throw new Error('source_missing')
    sourceBusinessId = source.business_id

    const ext = source.mime_type === 'video/quicktime' ? 'mov' : 'mp4'
    const inputPath = join(workDir, `source.${ext}`)
    const bytes = await downloadSourceToFile(source.storage_path, inputPath)
    console.log('[VideoClips] source downloaded', { jobId: job.id, bytes })

    const probe = await probeVideoDisplay(inputPath)
    const duration = probe.duration ?? 0
    sourceDurationSeconds = duration
    if (duration <= 0 || probe.displayWidth <= 0) throw new Error('invalid_source_video')

    let transcript = EMPTY_TRANSCRIPT
    if (probe.hasAudio) {
      await updateClipJob(db, job.id, { progress_stage: 'transcribing' })
      const audioPath = join(workDir, 'audio.mp3')
      await runFfmpeg(extractAudioArgs(inputPath, audioPath))
      transcript = await transcribeWords(audioPath)
    }

    const aboutText = source.about_text ?? source.title ?? null
    const { moments, selection } = await selectClipJobMoments({ db, job, transcript, duration, title: source.title, aboutText })
    momentSelection = selection
    renderedDurationSeconds = moments.reduce(
      (sum, moment) => sum + Math.max(0, Number(moment.end) - Number(moment.start)),
      0,
    )
    console.log('[VideoClips] moments selected', {
      jobId: job.id,
      count: moments.length,
      momentSource: selection.source,
      words: transcript.words.length,
    })

    await updateClipJob(db, job.id, { progress_stage: job.clip_length === 'full' ? 'preparing' : 'cutting' })
    const ctx: MomentClipContext = {
      db,
      job,
      source,
      inputPath,
      workDir,
      probe,
      words: transcript.words,
      aboutText,
      brandColor: await fetchBrandColor(db, source.business_id),
    }
    await runWithConcurrency(moments, CLIP_CONCURRENCY, async (moment) => {
      await renderMomentClip(ctx, moment)
      clipsCreated += 1
      await updateClipJob(db, job.id, { clips_created: clipsCreated })
      await betweenClips()
    })

    await updateClipJob(db, job.id, {
      status: 'completed',
      progress_stage: 'done',
      completed_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
    })
    if (sourceBusinessId) {
      await recordVideoClipJobUsageEstimate(db, {
        ...usageBase(sourceBusinessId),
        transcriptionModel:
          process.env.VIDEO_CLIP_TRANSCRIBE_MODEL?.trim() || DEFAULT_CLIP_TRANSCRIBE_MODEL,
        status: clipsCreated > 0 ? 'success' : 'partial',
      }).catch((err) => {
        console.warn('[VideoClips] usage estimate record failed', {
          jobId: job.id,
          error: err instanceof Error ? err.message : String(err),
        })
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'clip_job_failed'
    console.error('[VideoClips] job failed', { jobId: job.id, clipsCreated, error: message })
    await updateClipJob(db, job.id, {
      status: 'failed',
      error_code: message.slice(0, 80),
      error_message: message.slice(0, 500),
      completed_at: new Date().toISOString(),
    })
    if (sourceBusinessId) {
      await recordVideoClipJobUsageEstimate(db, {
        ...usageBase(sourceBusinessId),
        status: clipsCreated > 0 ? 'partial' : 'failed',
        errorCode: message.slice(0, 80),
      }).catch(() => undefined)
    }
    throw err
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
