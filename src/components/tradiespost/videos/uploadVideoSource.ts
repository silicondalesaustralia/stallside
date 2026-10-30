import { uploadFileWithProgress } from '@/components/social/VideoLibraryCard'
import {
  VIDEO_SOURCE_ERRORS,
  VIDEO_SOURCE_MAX_BYTES,
  VIDEO_SOURCE_MAX_DURATION_SECONDS,
  VIDEO_SOURCE_MIN_DURATION_SECONDS,
  isAllowedVideoSourceMime,
} from '@/lib/social/videoClips/limits'
import { clipJobDurationError, type ClipJobOptions } from '@/lib/social/videoClips/validation'
import { uploadFileInParts } from './uploadMultipart'

export function validateSourceFileClient(file: File, duration: number | null, options: ClipJobOptions): string | null {
  if (!isAllowedVideoSourceMime(file.type)) return VIDEO_SOURCE_ERRORS.unsupported
  if (file.size > VIDEO_SOURCE_MAX_BYTES) return VIDEO_SOURCE_ERRORS.tooLarge
  if (duration != null && duration > VIDEO_SOURCE_MAX_DURATION_SECONDS) {
    return VIDEO_SOURCE_ERRORS.tooLong
  }
  if (duration != null && duration < VIDEO_SOURCE_MIN_DURATION_SECONDS) {
    return VIDEO_SOURCE_ERRORS.tooShortUpload
  }
  return clipJobDurationError(options.clipLength, duration)
}

async function postJson(url: string, body: unknown, fallbackError: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || fallbackError)
  }
  return (await res.json()) as Record<string, unknown>
}

function parseMultipart(value: unknown): { uploadId: string; partSize: number; partUrls: string[] } | null {
  if (!value || typeof value !== 'object') return null
  const { uploadId, partSize, partUrls } = value as Record<string, unknown>
  if (typeof uploadId !== 'string' || typeof partSize !== 'number' || !Array.isArray(partUrls)) return null
  const urls = partUrls.filter((u): u is string => typeof u === 'string')
  return urls.length > 0 && urls.length === partUrls.length ? { uploadId, partSize, partUrls: urls } : null
}

export async function startClipJob(sourceId: string, options: ClipJobOptions): Promise<void> {
  const fallback = options.clipLength === 'full' ? 'Could not prepare this video' : 'Could not start clipping'
  await postJson(`/api/social/videos/${sourceId}/clip`, options, fallback)
}

/** Upload → finalize → queue clip job. */
export async function uploadAndClipVideo(input: {
  file: File
  durationSeconds: number
  title: string
  aboutText: string
  options: ClipJobOptions
  onProgress: (percent: number) => void
}): Promise<void> {
  const created = await postJson(
    '/api/social/videos/upload-url',
    {
      mimeType: input.file.type,
      size: input.file.size,
      title: input.title.trim() || undefined,
      aboutText: input.aboutText.trim() || undefined,
      multipart: true,
    },
    VIDEO_SOURCE_ERRORS.uploadFailed,
  )
  const sourceId = typeof created.sourceId === 'string' ? created.sourceId : ''
  const multipart = parseMultipart(created.multipart)
  const signedUrl = typeof created.signedUrl === 'string' ? created.signedUrl : ''
  if (!sourceId || (!multipart && !signedUrl)) throw new Error(VIDEO_SOURCE_ERRORS.uploadFailed)

  try {
    if (multipart) {
      await uploadFileInParts({ file: input.file, ...multipart, onProgress: input.onProgress })
    } else {
      await uploadFileWithProgress(signedUrl, input.file, input.file.type, input.onProgress)
    }
  } catch (err) {
    console.error('[VideoClips] upload failed', err)
    throw new Error(VIDEO_SOURCE_ERRORS.uploadFailed)
  }

  await postJson(
    `/api/social/videos/${sourceId}/finalize`,
    { durationSeconds: input.durationSeconds, uploadId: multipart?.uploadId },
    VIDEO_SOURCE_ERRORS.finalizeFailed,
  )
  await startClipJob(sourceId, input.options)
}
