import { CLIP_VIDEO_CRF, CLIP_VIDEO_PRESET, assFilter, clipVideoFilter, ffmpegThreadArgs } from './clipFfmpegArgs'
import { clipMaxEdge, clipRateArgs } from './clipSizeBudget'
import type { ClipAspect } from './limits'

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2)

/** Frame size `clipVideoFilter` produces for a source of the given display size. */
export function clipOutputSize(
  aspect: ClipAspect,
  width: number,
  height: number,
  maxEdge = 1920,
): { width: number; height: number } {
  if (aspect === 'vertical') {
    const cropW = Math.min(width, (height * 9) / 16)
    const cropH = Math.min(height, (width * 16) / 9)
    const outH = Math.min(maxEdge, Math.floor(cropH))
    return { width: even((cropW * outH) / cropH), height: outH }
  }
  if (width >= height) {
    const outW = Math.min(maxEdge, width)
    return { width: outW, height: even((height * outW) / width) }
  }
  const outH = Math.min(maxEdge, height)
  return { width: even((width * outH) / height), height: outH }
}

function encodeArgs(hasAudio: boolean, outputPath: string, seconds: number): string[] {
  return [
    '-c:v',
    'libx264',
    ...ffmpegThreadArgs(),
    '-preset',
    CLIP_VIDEO_PRESET,
    '-crf',
    CLIP_VIDEO_CRF,
    ...clipRateArgs(seconds),
    '-pix_fmt',
    'yuv420p',
    ...(hasAudio ? ['-map', '0:a:0', '-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    '-movflags',
    '+faststart',
    outputPath,
  ]
}

/**
 * One decode of the source → caption-free clip (kept for the editor) and the
 * captioned clip (published), instead of cutting then re-encoding the cut.
 */
export function cutClipWithCaptionsArgs(input: {
  inputPath: string
  cleanPath: string
  captionedPath: string
  start: number
  end: number
  aspect: ClipAspect
  hasAudio: boolean
  assPath: string
  fontsDir: string | null
}): string[] {
  const duration = Math.max(0.5, input.end - input.start)
  const graph = [
    `[0:v]${clipVideoFilter(input.aspect, clipMaxEdge(duration))},split=2[clean][cap]`,
    `[cap]${assFilter(input.assPath, input.fontsDir)}[captioned]`,
  ].join(';')
  return [
    '-y',
    ...ffmpegThreadArgs(),
    '-ss',
    input.start.toFixed(3),
    '-t',
    duration.toFixed(3),
    '-i',
    input.inputPath,
    '-filter_complex',
    graph,
    '-map',
    '[clean]',
    ...encodeArgs(input.hasAudio, input.cleanPath, duration),
    '-map',
    '[captioned]',
    ...encodeArgs(input.hasAudio, input.captionedPath, duration),
  ]
}
