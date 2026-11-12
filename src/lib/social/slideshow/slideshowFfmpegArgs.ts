import type { SlideshowTransition } from './slideshowTypes'

export const SLIDESHOW_VIDEO = { width: 1080, height: 1920, fps: 30 } as const
export const SLIDESHOW_TRANSITION_SECONDS = 0.5

export type SlideshowFfmpegInput = {
  imagePaths: string[]
  outputPath: string
  secondsPerSlide: number
  transition: SlideshowTransition
}

const XFADE: Record<Exclude<SlideshowTransition, 'none'>, string> = { fade: 'fade', slide: 'slideleft' }

export function slideshowDurationSeconds(slideCount: number, secondsPerSlide: number): number {
  return slideCount * secondsPerSlide
}

/**
 * Still images -> 9:16 H.264 MP4 with a silent AAC track, which every platform
 * (TikTok, Reels, Shorts, X, Pinterest) accepts. With crossfades each slide but the last
 * runs `T` seconds longer so the total stays `count * secondsPerSlide`.
 */
export function slideshowFfmpegArgs(input: SlideshowFfmpegInput): string[] {
  const { imagePaths, secondsPerSlide, transition } = input
  const { width, height, fps } = SLIDESHOW_VIDEO
  const count = imagePaths.length
  if (count < 1) throw new Error('slideshow_no_images')
  const overlap = transition === 'none' || count === 1 ? 0 : SLIDESHOW_TRANSITION_SECONDS
  const total = slideshowDurationSeconds(count, secondsPerSlide)

  const inputs = imagePaths.flatMap((path, i) => {
    const seconds = i < count - 1 ? secondsPerSlide + overlap : secondsPerSlide
    return ['-loop', '1', '-framerate', String(fps), '-t', String(seconds), '-i', path]
  })
  const audioIndex = count
  const audio = ['-f', 'lavfi', '-t', String(total), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100']

  const prep = imagePaths.map(
    (_, i) =>
      `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=increase:out_range=tv,crop=${width}:${height},setsar=1,fps=${fps},format=yuv420p[v${i}]`,
  )
  let joins: string[]
  let last: string
  if (overlap === 0) {
    const labels = imagePaths.map((_, i) => `[v${i}]`).join('')
    joins = [`${labels}concat=n=${count}:v=1:a=0[vout]`]
    last = 'vout'
  } else {
    const kind = transition === 'none' ? XFADE.fade : XFADE[transition]
    joins = []
    last = 'v0'
    for (let k = 1; k < count; k += 1) {
      const out = `x${k}`
      joins.push(`[${last}][v${k}]xfade=transition=${kind}:duration=${overlap}:offset=${k * secondsPerSlide}[${out}]`)
      last = out
    }
  }

  return [
    '-y',
    ...inputs,
    ...audio,
    '-filter_complex',
    [...prep, ...joins].join(';'),
    '-map', `[${last}]`,
    '-map', `${audioIndex}:a`,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '20',
    '-profile:v', 'high',
    '-level', '4.1',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    '-c:a', 'aac',
    '-b:a', '128k',
    '-t', String(total),
    '-movflags', '+faststart',
    input.outputPath,
  ]
}
