import type { MusicChoice } from './musicTypes'

const FADE_IN_SECONDS = 0.5
const FADE_OUT_SECONDS = 2

/** Music chain for the output length: loop, trim, set volume, fade in and out. */
export function musicFilter(durationSeconds: number, volume: number): string {
  const d = Math.max(0.1, durationSeconds)
  const fadeOut = Math.min(FADE_OUT_SECONDS, d / 2)
  const fadeIn = Math.min(FADE_IN_SECONDS, d / 4)
  return [
    `atrim=0:${d.toFixed(3)}`,
    'asetpts=PTS-STARTPTS',
    `volume=${volume.toFixed(2)}`,
    `afade=t=in:st=0:d=${fadeIn.toFixed(2)}`,
    `afade=t=out:st=${(d - fadeOut).toFixed(3)}:d=${fadeOut.toFixed(2)}`,
  ].join(',')
}

/**
 * Adds background music to a finished MP4: video stream copied untouched, audio rebuilt.
 * With sound: original * originalVolume mixed with the music (limited to avoid clipping).
 * Without sound (slideshows) or originalVolume 0: music only.
 */
export function musicMixArgs(input: {
  videoPath: string
  musicPath: string
  outputPath: string
  durationSeconds: number
  hasAudio: boolean
  music: Pick<MusicChoice, 'volume' | 'originalVolume'>
}): string[] {
  const d = Math.max(0.1, input.durationSeconds)
  const keepOriginal = input.hasAudio && input.music.originalVolume > 0
  const graph = keepOriginal
    ? [
        `[1:a]${musicFilter(d, input.music.volume)}[m]`,
        `[0:a]volume=${input.music.originalVolume.toFixed(2)}[o]`,
        '[o][m]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95[a]',
      ]
    : [`[1:a]${musicFilter(d, input.music.volume)}[a]`]
  return [
    '-y',
    '-i', input.videoPath,
    '-stream_loop', '-1',
    '-i', input.musicPath,
    '-filter_complex', graph.join(';'),
    '-map', '0:v:0',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-ar', '44100',
    '-t', d.toFixed(3),
    '-movflags', '+faststart',
    input.outputPath,
  ]
}
