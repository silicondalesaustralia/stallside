/** Must match the R2 bucket lifecycle rule that deletes source videos. */
export const VIDEO_SOURCE_RETENTION_DAYS = 7

export const VIDEO_SOURCE_MAX_BYTES = 1024 * 1024 * 1024 // 1 GB
export const VIDEO_SOURCE_MAX_DURATION_SECONDS = 30 * 60
export const VIDEO_SOURCE_MIN_DURATION_SECONDS = 3
export const CLIP_SOURCE_MIN_DURATION_SECONDS = 15
/** Whole-video edits must fit the 50 MB upload limit (see clipSizeBudget) at watchable quality. */
export const FULL_VIDEO_MAX_DURATION_SECONDS = 3 * 60

export const VIDEO_SOURCE_ALLOWED_MIMES = ['video/mp4', 'video/quicktime'] as const
export type VideoSourceMime = (typeof VIDEO_SOURCE_ALLOWED_MIMES)[number]

export const CLIP_COUNT_MIN = 1
export const CLIP_COUNT_MAX = 8
export const CLIP_COUNT_DEFAULT = 4

export type ClipLength = 'short' | 'medium'
/** 'full' keeps the whole upload as one clip for editing. */
export type ClipJobLength = ClipLength | 'full'
export type ClipAspect = 'vertical' | 'original'

export const CLIP_LENGTH_RANGES: Record<ClipLength, { min: number; max: number }> = {
  short: { min: 15, max: 30 },
  medium: { min: 30, max: 60 },
}

export const VIDEO_SOURCE_ERRORS = {
  unsupported: 'Upload an MP4 or MOV video.',
  tooLarge: 'This video is too large. Upload a video under 1 GB.',
  tooLong: 'Videos can be up to 30 minutes long.',
  tooShort: 'Videos need to be at least 15 seconds long to clip — use the whole video instead.',
  tooShortUpload: 'Videos need to be at least 3 seconds long.',
  fullTooLong: 'Using the whole video works for videos up to 3 minutes — make clips instead.',
  uploadFailed: "We couldn't upload this video. Please try again.",
  finalizeFailed: "We couldn't prepare this video. Please try again.",
  expired: `Uploaded videos are kept for ${VIDEO_SOURCE_RETENTION_DAYS} days. Upload it again to make more clips.`,
} as const

export function isVideoSourceExpired(createdAt: string, now: Date = new Date()): boolean {
  const ageMs = now.getTime() - new Date(createdAt).getTime()
  return ageMs >= VIDEO_SOURCE_RETENTION_DAYS * 24 * 60 * 60 * 1000
}

export function isAllowedVideoSourceMime(mime: string): mime is VideoSourceMime {
  return (VIDEO_SOURCE_ALLOWED_MIMES as readonly string[]).includes(mime)
}

/** Caption-free clip copy in the social-posts bucket (caption edits re-render from it). */
export function buildClipCleanPath(businessId: string, clipId: string): string {
  return `${businessId}/social/video/clean/${clipId}.mp4`
}

export function buildVideoSourcePath(
  businessId: string,
  sourceId: string,
  mime: VideoSourceMime,
): string {
  const ext = mime === 'video/quicktime' ? 'mov' : 'mp4'
  return `${businessId}/${sourceId}.${ext}`
}
