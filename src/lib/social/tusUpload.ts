/** Supabase requires exactly 6 MB chunks for TUS (last chunk may be smaller). */
export const TUS_CHUNK_BYTES = 6 * 1024 * 1024

const TUS_MAX_RETRIES = 6

export type TusChunkReader = (start: number, end: number) => Promise<BodyInit>

export type TusSignedUploadInput = {
  endpoint: string
  token: string
  bucket: string
  objectName: string
  contentType: string
  size: number
  readChunk: TusChunkReader
  onProgress?: (percent: number) => void
}

export class TusUploadError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
  ) {
    super(message)
    this.name = 'TusUploadError'
  }
}

export function signedResumableEndpoint(storageOrigin: string): string {
  return `${storageOrigin.replace(/\/$/, '')}/storage/v1/upload/resumable/sign`
}

function base64Utf8(value: string): string {
  let binary = ''
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function encodeMetadata(meta: Record<string, string>): string {
  return Object.entries(meta)
    .map(([key, value]) => `${key} ${base64Utf8(value)}`)
    .join(',')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isFatal(err: unknown): boolean {
  if (!(err instanceof TusUploadError) || err.status == null) return false
  return err.status >= 400 && err.status < 500 && err.status !== 409 && err.status !== 423
}

async function createUpload(input: TusSignedUploadInput, headers: Record<string, string>) {
  const res = await fetch(input.endpoint, {
    method: 'POST',
    headers: {
      ...headers,
      'Upload-Length': String(input.size),
      'Upload-Metadata': encodeMetadata({
        bucketName: input.bucket,
        objectName: input.objectName,
        contentType: input.contentType,
        cacheControl: '3600',
      }),
    },
  })
  if (!res.ok) throw new TusUploadError(`resumable create failed (${res.status})`, res.status)
  const location = res.headers.get('Location')
  if (!location) throw new TusUploadError('resumable create returned no upload URL')
  return new URL(location, input.endpoint).toString()
}

async function fetchServerOffset(url: string, headers: Record<string, string>): Promise<number> {
  const res = await fetch(url, { method: 'HEAD', headers })
  if (!res.ok) throw new TusUploadError(`resumable offset check failed (${res.status})`, res.status)
  const offset = Number(res.headers.get('Upload-Offset'))
  if (!Number.isFinite(offset)) throw new TusUploadError('resumable offset missing')
  return offset
}

/** Resumable upload to a Supabase signed upload token (TUS protocol, no client library). */
export async function uploadResumableSigned(input: TusSignedUploadInput): Promise<void> {
  const headers = { 'Tus-Resumable': '1.0.0', 'x-signature': input.token }
  const uploadUrl = await createUpload(input, headers)
  let offset = 0
  let failures = 0

  while (offset < input.size) {
    const end = Math.min(offset + TUS_CHUNK_BYTES, input.size)
    try {
      const body = await input.readChunk(offset, end)
      const res = await fetch(uploadUrl, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Upload-Offset': String(offset),
          'Content-Type': 'application/offset+octet-stream',
        },
        body,
      })
      if (!res.ok) throw new TusUploadError(`resumable chunk failed (${res.status})`, res.status)
      const next = Number(res.headers.get('Upload-Offset'))
      offset = Number.isFinite(next) && next > offset ? next : end
      failures = 0
      input.onProgress?.(Math.round((offset / input.size) * 100))
    } catch (err) {
      failures += 1
      if (failures > TUS_MAX_RETRIES || isFatal(err)) throw err
      await sleep(Math.min(20_000, 1000 * 2 ** failures))
      try {
        offset = await fetchServerOffset(uploadUrl, headers)
      } catch (offsetErr) {
        console.warn('[TusUpload] offset check failed, retrying chunk', offsetErr)
      }
    }
  }
}
