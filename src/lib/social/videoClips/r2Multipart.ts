import { presignR2Url } from './r2'

/** R2 requires every part except the last to be the same size (min 5 MiB). */
export const MULTIPART_PART_BYTES = 10 * 1024 * 1024
/** Below this a single PUT is as fast and simpler. */
export const MULTIPART_MIN_FILE_BYTES = 2 * MULTIPART_PART_BYTES

export function multipartPartCount(size: number): number {
  return Math.max(1, Math.ceil(size / MULTIPART_PART_BYTES))
}

export function parseUploadId(xml: string): string | null {
  const match = xml.match(/<UploadId>([^<]+)<\/UploadId>/)
  return match ? match[1] : null
}

/** Returns `{ partNumber, etag }` with the ETag kept XML-escaped, ready to echo back. */
export function parseListedParts(xml: string): { partNumber: number; etag: string }[] {
  const parts: { partNumber: number; etag: string }[] = []
  for (const block of xml.match(/<Part>[\s\S]*?<\/Part>/g) ?? []) {
    const num = block.match(/<PartNumber>(\d+)<\/PartNumber>/)
    const etag = block.match(/<ETag>([^<]+)<\/ETag>/)
    if (num && etag) parts.push({ partNumber: Number(num[1]), etag: etag[1] })
  }
  return parts.sort((a, b) => a.partNumber - b.partNumber)
}

export function completeMultipartXml(parts: { partNumber: number; etag: string }[]): string {
  const body = parts
    .map((p) => `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>${p.etag}</ETag></Part>`)
    .join('')
  return `<CompleteMultipartUpload>${body}</CompleteMultipartUpload>`
}

export async function createMultipartUpload(key: string, contentType: string): Promise<string> {
  const res = await fetch(presignR2Url('POST', key, 60, { uploads: '' }), {
    method: 'POST',
    headers: { 'Content-Type': contentType },
  })
  if (!res.ok) throw new Error(`r2_multipart_create_failed ${res.status}`)
  const uploadId = parseUploadId(await res.text())
  if (!uploadId) throw new Error('r2_multipart_create_failed no_upload_id')
  return uploadId
}

export function presignPartUrls(key: string, uploadId: string, count: number, ttlSeconds: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    presignR2Url('PUT', key, ttlSeconds, { partNumber: String(i + 1), uploadId }),
  )
}

/**
 * Completes using R2's own part list (ListParts), so the browser never needs to read
 * ETag response headers (which would require exposing them in the bucket CORS policy).
 */
export async function completeMultipartUpload(key: string, uploadId: string, expectedParts: number): Promise<void> {
  const listRes = await fetch(presignR2Url('GET', key, 60, { uploadId, 'max-parts': '1000' }))
  if (!listRes.ok) throw new Error(`r2_multipart_list_failed ${listRes.status}`)
  const parts = parseListedParts(await listRes.text())
  if (parts.length !== expectedParts) throw new Error(`r2_multipart_incomplete ${parts.length}/${expectedParts}`)

  const res = await fetch(presignR2Url('POST', key, 60, { uploadId }), {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: completeMultipartXml(parts),
  })
  const text = await res.text()
  // S3/R2 can return 200 with an <Error> body for CompleteMultipartUpload.
  if (!res.ok || text.includes('<Error>')) throw new Error(`r2_multipart_complete_failed ${res.status}`)
}
