import {
  CLIP_COUNT_DEFAULT,
  CLIP_COUNT_MAX,
  CLIP_COUNT_MIN,
  CLIP_SOURCE_MIN_DURATION_SECONDS,
  FULL_VIDEO_MAX_DURATION_SECONDS,
  VIDEO_SOURCE_ERRORS,
  VIDEO_SOURCE_MAX_BYTES,
  VIDEO_SOURCE_MAX_DURATION_SECONDS,
  VIDEO_SOURCE_MIN_DURATION_SECONDS,
  isAllowedVideoSourceMime,
  type ClipAspect,
  type ClipJobLength,
  type VideoSourceMime,
} from './limits'
import {
  parseCaptionPosition,
  parseCaptionStyle,
  type CaptionPosition,
  type CaptionStyleId,
} from './captionStyles'

type Fail = { ok: false; error: string }

export function validateVideoSourceUpload(input: {
  mimeType?: unknown
  size?: unknown
}): { ok: true; mimeType: VideoSourceMime; size: number } | Fail {
  const mimeType = typeof input.mimeType === 'string' ? input.mimeType.trim() : ''
  if (!isAllowedVideoSourceMime(mimeType)) {
    return { ok: false, error: VIDEO_SOURCE_ERRORS.unsupported }
  }
  const size = typeof input.size === 'number' ? input.size : Number(input.size)
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, error: 'Invalid file size' }
  }
  if (size > VIDEO_SOURCE_MAX_BYTES) {
    return { ok: false, error: VIDEO_SOURCE_ERRORS.tooLarge }
  }
  return { ok: true, mimeType, size }
}

export function validateVideoSourceDuration(
  value: unknown,
): { ok: true; durationSeconds: number } | Fail {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n <= 0) {
    return { ok: false, error: VIDEO_SOURCE_ERRORS.finalizeFailed }
  }
  if (n < VIDEO_SOURCE_MIN_DURATION_SECONDS) {
    return { ok: false, error: VIDEO_SOURCE_ERRORS.tooShortUpload }
  }
  if (n > VIDEO_SOURCE_MAX_DURATION_SECONDS) {
    return { ok: false, error: VIDEO_SOURCE_ERRORS.tooLong }
  }
  return { ok: true, durationSeconds: n }
}

export type ClipJobOptions = {
  clipCount: number
  clipLength: ClipJobLength
  aspect: ClipAspect
  captionStyle: CaptionStyleId
  captionPosition: CaptionPosition
}

export const DEFAULT_CLIP_JOB_OPTIONS: ClipJobOptions = {
  clipCount: CLIP_COUNT_DEFAULT,
  clipLength: 'short',
  aspect: 'vertical',
  captionStyle: 'bold',
  captionPosition: 'bottom',
}

export function parseClipJobOptions(input: {
  clipCount?: unknown
  clipLength?: unknown
  aspect?: unknown
  captionStyle?: unknown
  captionPosition?: unknown
}): ClipJobOptions {
  const rawCount = Number(input.clipCount)
  const clipLength: ClipJobLength =
    input.clipLength === 'full' ? 'full' : input.clipLength === 'medium' ? 'medium' : 'short'
  const clipCount =
    clipLength === 'full'
      ? 1
      : Number.isFinite(rawCount)
        ? Math.min(CLIP_COUNT_MAX, Math.max(CLIP_COUNT_MIN, Math.round(rawCount)))
        : CLIP_COUNT_DEFAULT
  const aspect: ClipAspect = input.aspect === 'original' ? 'original' : 'vertical'
  return {
    clipCount,
    clipLength,
    aspect,
    captionStyle: parseCaptionStyle(input.captionStyle),
    captionPosition: parseCaptionPosition(input.captionPosition),
  }
}

/** Clipping needs enough footage to pick from; whole-video mode is capped by storage size. */
export function clipJobDurationError(clipLength: ClipJobLength, durationSeconds: number | null): string | null {
  if (durationSeconds == null) return null
  if (clipLength === 'full') {
    return durationSeconds > FULL_VIDEO_MAX_DURATION_SECONDS ? VIDEO_SOURCE_ERRORS.fullTooLong : null
  }
  return durationSeconds < CLIP_SOURCE_MIN_DURATION_SECONDS ? VIDEO_SOURCE_ERRORS.tooShort : null
}

export function cleanOptionalText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().slice(0, max)
  return trimmed || null
}
