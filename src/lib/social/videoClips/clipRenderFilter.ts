import { buildPreBrandingFilters } from '@/lib/social/videoBranding/videoFilters'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'
import { CLIP_VIDEO_CRF, CLIP_VIDEO_PRESET, assFilter, ffmpegThreadArgs } from './clipFfmpegArgs'
import { clipRateArgs } from './clipSizeBudget'
import { buildEditFilterGraph } from './editFfmpegArgs'
import type { ClipSegment } from './timeline'

/**
 * Cuts/speed/mutes, then blur (output time), then captions — one encode.
 * When `edited` is false, blur/ass read straight from the source video.
 */
export function buildClipRenderFilterGraph(input: {
  edited: boolean
  segments: ClipSegment[]
  hasAudio: boolean
  assPath: string | null
  fontsDir?: string | null
  speed?: number
  audioMutes?: ClipSegment[]
  blurRegions: VideoBlurRegion[]
  frameWidth: number
  frameHeight: number
}): { filterComplex: string; videoLabel: string; audioLabel: string | null } {
  const filters: string[] = []
  if (input.edited) {
    filters.push(buildEditFilterGraph({ ...input, assPath: null }))
  }
  const pre = buildPreBrandingFilters({
    sourceLabel: input.edited ? 'vout' : '0:v',
    scaleTo: null,
    frameWidth: input.frameWidth,
    frameHeight: input.frameHeight,
    blurRegions: input.blurRegions,
  })
  filters.push(...pre.filters)
  let videoLabel = pre.label
  if (input.assPath) {
    filters.push(`[${videoLabel}]${assFilter(input.assPath, input.fontsDir ?? null)}[v_ass]`)
    videoLabel = 'v_ass'
  }
  return {
    filterComplex: filters.join(';'),
    videoLabel,
    audioLabel: input.edited && input.hasAudio ? 'aout' : null,
  }
}

/** Full clip re-render with optional cuts, blur and burned captions. */
export function clipRenderArgs(input: {
  inputPath: string
  outputPath: string
  edited: boolean
  segments: ClipSegment[]
  hasAudio: boolean
  assPath: string | null
  fontsDir?: string | null
  speed?: number
  audioMutes?: ClipSegment[]
  blurRegions: VideoBlurRegion[]
  frameWidth: number
  frameHeight: number
  outputSeconds: number
}): string[] {
  const graph = buildClipRenderFilterGraph(input)
  return [
    '-y',
    ...ffmpegThreadArgs(),
    '-i',
    input.inputPath,
    '-filter_complex',
    graph.filterComplex,
    '-map',
    `[${graph.videoLabel}]`,
    ...(graph.audioLabel
      ? ['-map', `[${graph.audioLabel}]`, '-c:a', 'aac', '-b:a', '128k']
      : input.hasAudio
        ? ['-map', '0:a:0?', '-c:a', 'aac', '-b:a', '128k']
        : ['-an']),
    '-c:v',
    'libx264',
    ...ffmpegThreadArgs(),
    '-preset',
    CLIP_VIDEO_PRESET,
    '-crf',
    CLIP_VIDEO_CRF,
    ...clipRateArgs(input.outputSeconds),
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    input.outputPath,
  ]
}
