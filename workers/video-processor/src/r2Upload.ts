import { open } from 'node:fs/promises'
import { presignR2Url } from '../../../src/lib/social/videoClips/r2'
import {
  MULTIPART_PART_BYTES,
  completeMultipartUpload,
  createMultipartUpload,
  multipartPartCount,
} from '../../../src/lib/social/videoClips/r2Multipart'

const PARALLEL_PARTS = 4
const PART_ATTEMPTS = 4
const PART_TIMEOUT_MS = 3 * 60 * 1000
const PART_URL_TTL_SECONDS = 60 * 60

async function putPart(url: string, body: Buffer, contentType?: string): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: contentType ? { 'Content-Type': contentType } : undefined,
        body: new Uint8Array(body),
        signal: AbortSignal.timeout(PART_TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`r2_part_upload_failed ${res.status}`)
      return
    } catch (err) {
      if (attempt >= PART_ATTEMPTS) throw err
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
    }
  }
}

/** Uploads a local file to R2, in parallel 10 MiB parts when it is large. Returns its size. */
export async function uploadFileToR2(key: string, filePath: string, contentType: string): Promise<number> {
  const file = await open(filePath, 'r')
  try {
    const { size } = await file.stat()
    const readRange = async (start: number, length: number) => {
      const buf = Buffer.alloc(length)
      const { bytesRead } = await file.read(buf, 0, length, start)
      return buf.subarray(0, bytesRead)
    }

    if (size <= MULTIPART_PART_BYTES) {
      await putPart(presignR2Url('PUT', key, PART_URL_TTL_SECONDS), await readRange(0, size), contentType)
      return size
    }

    const uploadId = await createMultipartUpload(key, contentType)
    const count = multipartPartCount(size)
    let next = 0
    const lane = async () => {
      while (next < count) {
        const index = next++
        const start = index * MULTIPART_PART_BYTES
        const body = await readRange(start, Math.min(MULTIPART_PART_BYTES, size - start))
        const url = presignR2Url('PUT', key, PART_URL_TTL_SECONDS, {
          partNumber: String(index + 1),
          uploadId,
        })
        await putPart(url, body)
      }
    }
    await Promise.all(Array.from({ length: Math.min(PARALLEL_PARTS, count) }, lane))
    await completeMultipartUpload(key, uploadId, count)
    return size
  } finally {
    await file.close()
  }
}
