import { readApiJson } from '@/lib/http/readApiJson'
import { INSPIRATION_MAX_BYTES } from '@/lib/social/inspirationTempStorage'
import { resolveInspirationUploadMime } from '@/lib/social/inspirationUploadMime'

export const COMPOSE_UPLOAD_MAX_BYTES = INSPIRATION_MAX_BYTES

export const COMPOSE_UPLOAD_ERRORS = {
  tooLarge: 'Image is too large. Please choose an image under 4 MB.',
  unsupported: 'Use a JPG, PNG or WebP image.',
  failed: 'Couldn’t upload this image. Please try again.',
  interrupted: 'Upload was interrupted. Please try again.',
} as const

type UploadUrlResponse = { ok: true; signedUrl: string; path: string } | { error: string }
type ReadUrlResponse = { ok: true; url: string; path?: string } | { error: string }

/** Client-safe: preview blob/data/file URLs must never be sent to AI endpoints. */
export function isCanonicalHttpsPhotoUrl(value: string | null | undefined): boolean {
  const raw = value?.trim()
  if (!raw) return false
  try {
    return new URL(raw).protocol === 'https:'
  } catch {
    return false
  }
}

export function validateComposeUploadFile(file: File): { ok: true; mimeType: string } | { ok: false; error: string } {
  const mimeType = resolveInspirationUploadMime(file)
  if (!mimeType) return { ok: false, error: COMPOSE_UPLOAD_ERRORS.unsupported }
  if (file.size > COMPOSE_UPLOAD_MAX_BYTES) return { ok: false, error: COMPOSE_UPLOAD_ERRORS.tooLarge }
  return { ok: true, mimeType }
}

export function mapComposeUploadFailure(err: unknown): string {
  if (err instanceof TypeError) return COMPOSE_UPLOAD_ERRORS.interrupted
  const message = err instanceof Error ? err.message : ''
  if (message.includes('Unexpected token') || message.includes('Request Entity') || /<!doctype html/i.test(message)) {
    return COMPOSE_UPLOAD_ERRORS.failed
  }
  if (
    message === COMPOSE_UPLOAD_ERRORS.tooLarge ||
    message === COMPOSE_UPLOAD_ERRORS.unsupported ||
    message === COMPOSE_UPLOAD_ERRORS.interrupted
  ) {
    return message
  }
  if (/too large|4 MB/i.test(message)) return COMPOSE_UPLOAD_ERRORS.tooLarge
  if (/jpg|png|webp|image file/i.test(message)) return COMPOSE_UPLOAD_ERRORS.unsupported
  return COMPOSE_UPLOAD_ERRORS.failed
}

export async function uploadInspirationTempFile(
  file: File,
): Promise<{ path: string; previewUrl: string; httpsUrl: string; mimeType: string }> {
  const validated = validateComposeUploadFile(file)
  if (!validated.ok) throw new Error(validated.error)

  let urlRes: Response
  try {
    urlRes = await fetch('/api/social/inspiration-analyze/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType: validated.mimeType, size: file.size }),
    })
  } catch (err) {
    throw new Error(mapComposeUploadFailure(err))
  }

  let urlJson: UploadUrlResponse
  try {
    urlJson = await readApiJson<UploadUrlResponse>(urlRes)
  } catch (err) {
    throw new Error(mapComposeUploadFailure(err))
  }
  if (!urlRes.ok || !('signedUrl' in urlJson) || !urlJson.signedUrl || !urlJson.path) {
    throw new Error(mapComposeUploadFailure(new Error((urlJson as { error?: string }).error || COMPOSE_UPLOAD_ERRORS.failed)))
  }

  let putRes: Response
  try {
    putRes = await fetch(urlJson.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': validated.mimeType },
      body: file,
    })
  } catch (err) {
    throw new Error(mapComposeUploadFailure(err))
  }
  if (!putRes.ok) {
    throw new Error(COMPOSE_UPLOAD_ERRORS.failed)
  }

  let readRes: Response
  try {
    readRes = await fetch('/api/social/inspiration-analyze/read-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: urlJson.path }),
    })
  } catch (err) {
    throw new Error(mapComposeUploadFailure(err))
  }

  let readJson: ReadUrlResponse
  try {
    readJson = await readApiJson<ReadUrlResponse>(readRes)
  } catch (err) {
    throw new Error(mapComposeUploadFailure(err))
  }
  if (!readRes.ok || !('url' in readJson) || !isCanonicalHttpsPhotoUrl(readJson.url)) {
    throw new Error(mapComposeUploadFailure(new Error((readJson as { error?: string }).error || COMPOSE_UPLOAD_ERRORS.failed)))
  }

  return {
    path: urlJson.path,
    previewUrl: URL.createObjectURL(file),
    httpsUrl: readJson.url,
    mimeType: validated.mimeType,
  }
}
