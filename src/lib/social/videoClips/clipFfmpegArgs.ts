import { clipMaxEdge, clipRateArgs } from './clipSizeBudget'
import type { ClipAspect } from './limits'

export const CLIP_VIDEO_PRESET = 'veryfast'
export const CLIP_VIDEO_CRF = '23'

/**
 * Containers often report the host's full core count, so ffmpeg/x264 would start dozens of
 * threads, each holding frames in memory, and get OOM-killed. Cap decode + encode threads.
 */
export function ffmpegThreadArgs(): string[] {
  const n = Math.min(16, Math.max(1, Math.floor(Number(process.env.VIDEO_FFMPEG_THREADS) || 2)))
  return ['-threads', String(n)]
}

/** Mono 16 kHz 48 kbps MP3 keeps a 30-minute source under OpenAI's 25 MB upload cap. */
export function extractAudioArgs(inputPath: string, outputPath: string): string[] {
  return ['-y', '-i', inputPath, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', outputPath]
}

export function clipVideoFilter(aspect: ClipAspect, maxEdge = 1920): string {
  if (aspect === 'vertical') {
    return [
      "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)'",
      `scale=-2:'min(${maxEdge},ih)'`,
      'setsar=1',
    ].join(',')
  }
  return `scale='if(gte(iw,ih),min(${maxEdge},iw),-2)':'if(gte(iw,ih),-2,min(${maxEdge},ih))',setsar=1`
}

export function cutClipArgs(input: {
  inputPath: string
  outputPath: string
  start: number
  end: number
  aspect: ClipAspect
  hasAudio: boolean
}): string[] {
  const duration = Math.max(0.5, input.end - input.start)
  return [
    '-y',
    ...ffmpegThreadArgs(),
    '-ss',
    input.start.toFixed(3),
    '-i',
    input.inputPath,
    '-t',
    duration.toFixed(3),
    '-vf',
    clipVideoFilter(input.aspect, clipMaxEdge(duration)),
    '-c:v',
    'libx264',
    ...ffmpegThreadArgs(),
    '-preset',
    CLIP_VIDEO_PRESET,
    '-crf',
    CLIP_VIDEO_CRF,
    ...clipRateArgs(duration),
    '-pix_fmt',
    'yuv420p',
    ...(input.hasAudio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    '-movflags',
    '+faststart',
    input.outputPath,
  ]
}

/** Paths must not contain ':' or quotes (worker uses uuid temp paths and /app/lib/social/fonts). */
export function assFilter(assPath: string, fontsDir: string | null): string {
  return fontsDir ? `ass=${assPath}:fontsdir=${fontsDir}` : `ass=${assPath}`
}

export function burnCaptionsArgs(input: {
  inputPath: string
  assPath: string
  outputPath: string
  hasAudio: boolean
  fontsDir: string | null
  durationSeconds: number
}): string[] {
  return [
    '-y',
    ...ffmpegThreadArgs(),
    '-i',
    input.inputPath,
    '-vf',
    assFilter(input.assPath, input.fontsDir),
    '-c:v',
    'libx264',
    ...ffmpegThreadArgs(),
    '-preset',
    CLIP_VIDEO_PRESET,
    '-crf',
    CLIP_VIDEO_CRF,
    ...clipRateArgs(input.durationSeconds),
    '-pix_fmt',
    'yuv420p',
    ...(input.hasAudio ? ['-c:a', 'copy'] : ['-an']),
    '-movflags',
    '+faststart',
    input.outputPath,
  ]
}

export function clipThumbnailArgs(clipPath: string, outputPath: string, at: number): string[] {
  return [
    '-y',
    '-ss',
    at.toFixed(2),
    '-i',
    clipPath,
    '-frames:v',
    '1',
    '-vf',
    "scale='min(640,iw)':-2",
    '-c:v',
    'libwebp',
    '-quality',
    '85',
    outputPath,
  ]
}
