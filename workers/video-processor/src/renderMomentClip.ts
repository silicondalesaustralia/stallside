import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClipJobRow, ClipMoment, TranscriptWord } from '../../../src/lib/social/videoClips/types'
import { wordsForClip } from '../../../src/lib/social/videoClips/selectMoments'
import { burnCaptionsArgs, clipThumbnailArgs, cutClipArgs } from '../../../src/lib/social/videoClips/clipFfmpegArgs'
import { clipOutputSize, cutClipWithCaptionsArgs } from '../../../src/lib/social/videoClips/cutCaptionedArgs'
import { clipMaxEdge } from '../../../src/lib/social/videoClips/clipSizeBudget'
import { groupWordsIntoCues } from '../../../src/lib/social/videoClips/captionCues'
import { parseCaptionSettings } from '../../../src/lib/social/videoClips/captionStyles'
import { runFfmpeg } from '../../../src/lib/social/videoBranding/runFfmpeg'
import { workerFontsRoot } from '../../../src/lib/social/videoBranding/videoHeadlineFonts'
import { saveClipToLibrary } from './clipJobStorage'
import { writeClipAss } from './captionRender'

/**
 * One decode → clean + captioned outputs runs two encoders at once (~640 MB peak on 4K HEVC vs
 * ~440 MB for a single encode), which OOMs 0.5 GB instances. Opt in on 2 GB+ machines.
 */
const SINGLE_PASS_CAPTIONS = process.env.VIDEO_SINGLE_PASS_CAPTIONS === '1'

export type MomentClipContext = {
  db: SupabaseClient
  job: ClipJobRow
  source: { id: string; business_id: string; job_id: string | null }
  inputPath: string
  workDir: string
  probe: { displayWidth: number; displayHeight: number; hasAudio: boolean }
  words: TranscriptWord[]
  aboutText: string | null
  brandColor: string | null
}

/** Cuts one moment into a caption-free + captioned clip, thumbnails it, saves it. */
export async function renderMomentClip(ctx: MomentClipContext, moment: ClipMoment): Promise<void> {
  const { job, probe } = ctx
  const clipId = randomUUID()
  const cleanPath = join(ctx.workDir, `${clipId}.mp4`)
  const words = wordsForClip(ctx.words, moment.start, moment.end)
  const captions = {
    words,
    cues: groupWordsIntoCues(words),
    settings: parseCaptionSettings({ style: job.caption_style, position: job.caption_position }),
    cleanDuration: Math.round((moment.end - moment.start) * 100) / 100,
    segments: null,
    overlays: [],
  }

  const seconds = moment.end - moment.start
  const size = clipOutputSize(job.aspect, probe.displayWidth, probe.displayHeight, clipMaxEdge(seconds))
  const assPath = await writeClipAss({ captions, brandColor: ctx.brandColor, ...size, workDir: ctx.workDir })
  let publishPath = cleanPath
  if (assPath && SINGLE_PASS_CAPTIONS) {
    publishPath = join(ctx.workDir, `${clipId}-captioned.mp4`)
    await runFfmpeg(
      cutClipWithCaptionsArgs({
        inputPath: ctx.inputPath,
        cleanPath,
        captionedPath: publishPath,
        start: moment.start,
        end: moment.end,
        aspect: job.aspect,
        hasAudio: probe.hasAudio,
        assPath,
        fontsDir: workerFontsRoot(),
      }),
    )
  } else {
    await runFfmpeg(
      cutClipArgs({
        inputPath: ctx.inputPath,
        outputPath: cleanPath,
        start: moment.start,
        end: moment.end,
        aspect: job.aspect,
        hasAudio: probe.hasAudio,
      }),
    )
    if (assPath) {
      publishPath = join(ctx.workDir, `${clipId}-captioned.mp4`)
      await runFfmpeg(
        burnCaptionsArgs({
          inputPath: cleanPath,
          assPath,
          outputPath: publishPath,
          hasAudio: probe.hasAudio,
          fontsDir: workerFontsRoot(),
          durationSeconds: seconds,
        }),
      )
    }
  }

  const thumbPath = join(ctx.workDir, `${clipId}.webp`)
  const thumbOk = await runFfmpeg(clipThumbnailArgs(publishPath, thumbPath, 1))
    .then(() => true)
    .catch((err: unknown) => {
      console.warn('[VideoClips] thumbnail failed', err instanceof Error ? err.message : err)
      return false
    })

  await saveClipToLibrary(ctx.db, {
    clipId,
    businessId: ctx.source.business_id,
    jobId: ctx.source.job_id,
    sourceId: ctx.source.id,
    clipJobId: job.id,
    moment,
    aboutText: ctx.aboutText,
    clipPath: publishPath,
    cleanClipPath: cleanPath,
    thumbPath: thumbOk ? thumbPath : null,
    captions,
  })
}
