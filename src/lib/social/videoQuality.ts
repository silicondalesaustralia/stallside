export const VIDEO_QUALITIES = ['auto', '720p', '1080p'] as const
export type VideoQuality = (typeof VIDEO_QUALITIES)[number]

export const VIDEO_QUALITY_LABELS: Record<VideoQuality, string> = {
  auto: 'Auto',
  '720p': '720p',
  '1080p': '1080p (HD)',
}

export type VideoEncodeSettings = { preset: string; crf: string }

/** Auto favours render speed; a picked resolution spends more encode time on picture quality. */
const AUTO_ENCODE: VideoEncodeSettings = { preset: 'veryfast', crf: '23' }
/** `faster` keeps x264 lookahead/refs (and so worker memory) close to `veryfast`. */
const PICKED_ENCODE: VideoEncodeSettings = { preset: 'faster', crf: '20' }

export function isVideoQuality(value: unknown): value is VideoQuality {
  return typeof value === 'string' && (VIDEO_QUALITIES as readonly string[]).includes(value)
}

export function parseVideoQuality(value: unknown): VideoQuality {
  return isVideoQuality(value) ? value : 'auto'
}

/** Longest frame edge for a picked resolution; null leaves the caller's automatic choice. */
export function videoQualityMaxEdge(quality: VideoQuality | null | undefined): number | null {
  if (quality === '720p') return 1280
  if (quality === '1080p') return 1920
  return null
}

export function videoEncodeSettings(quality: VideoQuality | null | undefined): VideoEncodeSettings {
  return quality === '720p' || quality === '1080p' ? PICKED_ENCODE : AUTO_ENCODE
}
