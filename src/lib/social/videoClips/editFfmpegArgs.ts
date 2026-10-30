import { CLIP_VIDEO_CRF, CLIP_VIDEO_PRESET, assFilter, ffmpegThreadArgs } from './clipFfmpegArgs'
import { clipRateArgs } from './clipSizeBudget'
import { muteVolumeFilter, mutesWithin } from './audioEdits'
import type { ClipSegment } from './timeline'

/**
 * Cut kept segments, concat, then optionally burn captions — one encode.
 * assPath must not contain ':' or quotes (worker uses uuid temp paths).
 */
export function buildEditFilterGraph(input: {
  segments: ClipSegment[]
  hasAudio: boolean
  assPath: string | null
  fontsDir?: string | null
  /** Final playback speed; 1 = unchanged. */
  speed?: number
  /** Silenced voice ranges in clip time. */
  audioMutes?: ClipSegment[]
}): string {
  const parts: string[] = []
  const concatInputs: string[] = []
  input.segments.forEach((seg, i) => {
    const s = seg.s.toFixed(3)
    const e = seg.e.toFixed(3)
    parts.push(`[0:v]trim=start=${s}:end=${e},setpts=PTS-STARTPTS[v${i}]`)
    concatInputs.push(`[v${i}]`)
    if (input.hasAudio) {
      const mute = muteVolumeFilter(mutesWithin(input.audioMutes ?? [], seg))
      parts.push(`[0:a]atrim=start=${s}:end=${e},${mute ? `${mute},` : ''}asetpts=PTS-STARTPTS[a${i}]`)
      concatInputs.push(`[a${i}]`)
    }
  })
  const n = input.segments.length
  const speed = input.speed ?? 1
  const sped = speed !== 1
  const video = sped ? '[vsped]' : '[vcat]'
  const concatOut = input.hasAudio ? `[vcat]${sped ? '[acat]' : '[aout]'}` : '[vcat]'
  parts.push(`${concatInputs.join('')}concat=n=${n}:v=1:a=${input.hasAudio ? 1 : 0}${concatOut}`)
  if (sped) {
    parts.push(`[vcat]setpts=PTS/${speed}[vsped]`)
    if (input.hasAudio) parts.push(`[acat]atempo=${speed}[aout]`)
  }
  parts.push(input.assPath ? `${video}${assFilter(input.assPath, input.fontsDir ?? null)}[vout]` : `${video}null[vout]`)
  return parts.join(';')
}

export function editRenderArgs(input: {
  inputPath: string
  outputPath: string
  segments: ClipSegment[]
  hasAudio: boolean
  assPath: string | null
  fontsDir?: string | null
  speed?: number
  audioMutes?: ClipSegment[]
  /** Length of the rendered output, for the size budget. */
  outputSeconds: number
}): string[] {
  return [
    '-y',
    ...ffmpegThreadArgs(),
    '-i',
    input.inputPath,
    '-filter_complex',
    buildEditFilterGraph(input),
    '-map',
    '[vout]',
    ...(input.hasAudio ? ['-map', '[aout]', '-c:a', 'aac', '-b:a', '128k'] : ['-an']),
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
