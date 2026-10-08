import {
  SOCIAL_VIDEO_MAX_BYTES,
  SOCIAL_VIDEO_MAX_DURATION_SECONDS,
  isAllowedSocialVideoMime,
  type SocialVideoMime,
} from '@/lib/social/videoUploadLimits'

export type UploadUrlRequestValidation =
  | { ok: true; mimeType: SocialVideoMime; size: number }
  | { ok: false; error: string; status: number }

export function validateSocialVideoUploadRequest(input: {
  mimeType?: string
  size?: unknown
}): UploadUrlRequestValidation {
  const mimeType = input.mimeType?.trim() || ''
  if (!isAllowedSocialVideoMime(mimeType)) {
    return {
      ok: false,
      error: 'Upload an MP4 or MOV video.',
      status: 400,
    }
  }

  const size =
    typeof input.size === 'number' ? input.size : Number(input.size)
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, error: 'Invalid file size', status: 400 }
  }
  if (size > SOCIAL_VIDEO_MAX_BYTES) {
    return {
      ok: false,
      error: 'This video is too large. Upload a video under 250 MB.',
      status: 400,
    }
  }

  return { ok: true, mimeType, size }
}

export type FinalizeRequestValidation =
  | {
      ok: true
      durationSeconds: number
      width: number | null
      height: number | null
    }
  | { ok: false; error: string; status: number; markFailed?: boolean }

export function validateSocialVideoFinalizeRequest(input: {
  durationSeconds?: unknown
  width?: unknown
  height?: unknown
}): FinalizeRequestValidation {
  const durationSeconds =
    typeof input.durationSeconds === 'number'
      ? input.durationSeconds
      : Number(input.durationSeconds)

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return {
      ok: false,
      error: "We couldn't prepare this video for your Library.",
      status: 400,
      markFailed: true,
    }
  }

  if (durationSeconds > SOCIAL_VIDEO_MAX_DURATION_SECONDS) {
    return {
      ok: false,
      error: 'Videos can currently be up to 60 seconds.',
      status: 400,
      markFailed: true,
    }
  }

  const width =
    input.width == null
      ? null
      : typeof input.width === 'number'
        ? input.width
        : Number(input.width)
  const height =
    input.height == null
      ? null
      : typeof input.height === 'number'
        ? input.height
        : Number(input.height)

  if (width != null && (!Number.isFinite(width) || width <= 0 || width > 10000)) {
    return {
      ok: false,
      error: "We couldn't prepare this video for your Library.",
      status: 400,
      markFailed: true,
    }
  }
  if (height != null && (!Number.isFinite(height) || height <= 0 || height > 10000)) {
    return {
      ok: false,
      error: "We couldn't prepare this video for your Library.",
      status: 400,
      markFailed: true,
    }
  }

  return {
    ok: true,
    durationSeconds,
    width: width != null && Number.isFinite(width) ? width : null,
    height: height != null && Number.isFinite(height) ? height : null,
  }
}

const THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024

export function validateThumbnailUploadRequest(size: unknown): { ok: true; size: number } | { ok: false; error: string } {
  const n = typeof size === 'number' ? size : Number(size)
  if (!Number.isFinite(n) || n <= 0) {
    return { ok: false, error: 'Invalid thumbnail size' }
  }
  if (n > THUMBNAIL_MAX_BYTES) {
    return { ok: false, error: 'Thumbnail too large' }
  }
  return { ok: true, size: n }
}

export const SOCIAL_VIDEO_THUMBNAIL_MAX_BYTES = THUMBNAIL_MAX_BYTES
