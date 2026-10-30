import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { buildAssSubtitles } from '../../../src/lib/social/videoClips/captionAss'
import type { CaptionsDoc } from '../../../src/lib/social/videoClips/captionCues'
import { resolveHighlightColor } from '../../../src/lib/social/videoClips/captionStyles'
import { burnCaptionsArgs } from '../../../src/lib/social/videoClips/clipFfmpegArgs'
import { editRenderArgs } from '../../../src/lib/social/videoClips/editFfmpegArgs'
import { fullSegments, isFullClip, mapCaptionsToOutput, mapTimedToOutput, outputDuration } from '../../../src/lib/social/videoClips/timeline'
import { parseClipSpeed, scaleTimed } from '../../../src/lib/social/videoClips/playbackSpeed'
import { workerFontsRoot } from '../../../src/lib/social/videoBranding/videoHeadlineFonts'
import { runFfmpeg } from '../../../src/lib/social/videoBranding/runFfmpeg'
import { probeVideoDisplay } from '../../../src/lib/social/videoBranding/processBrandingLocally'

export async function fetchBrandColor(db: SupabaseClient, businessId: string): Promise<string | null> {
  const { data, error } = await db
    .from('businesses')
    .select('brand_color')
    .eq('id', businessId)
    .maybeSingle()
  if (error) {
    console.warn('[VideoClips] brand colour lookup failed', error.message)
    return null
  }
  return typeof data?.brand_color === 'string' ? data.brand_color : null
}

type BurnedText = Pick<CaptionsDoc, 'cues' | 'words' | 'settings' | 'overlays'>

export function hasBurnedText(captions: Pick<CaptionsDoc, 'cues' | 'settings' | 'overlays'>): boolean {
  return (captions.settings.style !== 'none' && captions.cues.length > 0) || captions.overlays.length > 0
}

/** Writes the .ass file for captions + overlays in output time; null when there is nothing to burn. */
export async function writeClipAss(input: {
  captions: BurnedText
  brandColor: string | null
  width: number
  height: number
  workDir: string
}): Promise<string | null> {
  const { captions } = input
  if (!hasBurnedText(captions) || input.width <= 0 || input.height <= 0) return null
  const assPath = join(input.workDir, `${randomUUID()}.ass`)
  const ass = buildAssSubtitles({
    cues: captions.settings.style !== 'none' ? captions.cues : [],
    words: captions.words,
    settings: captions.settings,
    highlightColor: resolveHighlightColor(captions.settings, input.brandColor),
    width: input.width,
    height: input.height,
    overlays: captions.overlays,
  })
  await writeFile(assPath, ass, 'utf8')
  return assPath
}

/**
 * Applies cuts + burns captions onto a caption-free clip. Returns the file to
 * publish (the clean file itself when there is nothing to change) and its length.
 */
export async function renderCaptionedClip(input: {
  cleanPath: string
  workDir: string
  captions: Pick<CaptionsDoc, 'cues' | 'words' | 'settings' | 'segments' | 'overlays' | 'speed' | 'audioMutes'>
  brandColor: string | null
}): Promise<{ path: string; durationSeconds: number }> {
  const { captions } = input
  const probe = await probeVideoDisplay(input.cleanPath)
  const duration = probe.duration ?? 0
  const speed = parseClipSpeed(captions.speed)
  const audioMutes = probe.hasAudio ? (captions.audioMutes ?? []) : []
  const cut = !!captions.segments && !isFullClip(captions.segments, duration)
  const segments = cut && captions.segments ? captions.segments : fullSegments(duration)
  const edited = cut || ((speed !== 1 || audioMutes.length > 0) && duration > 0)
  const cutCaptions = cut
    ? mapCaptionsToOutput(captions.cues, captions.words, segments)
    : { cues: captions.cues, words: captions.words }
  const mapped = { cues: scaleTimed(cutCaptions.cues, speed), words: scaleTimed(cutCaptions.words, speed) }
  const overlays = scaleTimed(cut ? mapTimedToOutput(captions.overlays, segments) : captions.overlays, speed)
  const outDuration = (cut ? outputDuration(segments) : duration) / speed
  if (!edited && !hasBurnedText({ ...captions, cues: mapped.cues, overlays })) {
    return { path: input.cleanPath, durationSeconds: duration }
  }

  const outputPath = join(input.workDir, `${randomUUID()}-rendered.mp4`)
  const fontsDir = workerFontsRoot()
  const assPath = await writeClipAss({
    captions: { ...captions, cues: mapped.cues, words: mapped.words, overlays },
    brandColor: input.brandColor,
    width: probe.displayWidth,
    height: probe.displayHeight,
    workDir: input.workDir,
  })

  if (edited) {
    await runFfmpeg(
      editRenderArgs({ inputPath: input.cleanPath, outputPath, segments, hasAudio: probe.hasAudio, assPath, fontsDir, speed, audioMutes, outputSeconds: outDuration }),
    )
  } else if (assPath) {
    await runFfmpeg(
      burnCaptionsArgs({ inputPath: input.cleanPath, assPath, outputPath, hasAudio: probe.hasAudio, fontsDir, durationSeconds: duration }),
    )
  } else {
    return { path: input.cleanPath, durationSeconds: duration }
  }
  return { path: outputPath, durationSeconds: outDuration }
}
