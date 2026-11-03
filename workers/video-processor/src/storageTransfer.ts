import { open, writeFile } from 'node:fs/promises'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signedResumableEndpoint, uploadResumableSigned } from '../../../src/lib/social/tusUpload'
import { SOCIAL_VIDEO_BUCKET } from './supabase'

const DOWNLOAD_URL_TTL_SECONDS = 60 * 60

/** Streams a storage object to disk so multi-GB originals never sit in memory. */
export async function downloadStorageObject(
  db: SupabaseClient,
  bucket: string,
  path: string,
  destPath: string,
): Promise<number> {
  const { data, error } = await db.storage
    .from(bucket)
    .createSignedUrl(path, DOWNLOAD_URL_TTL_SECONDS)
  if (error || !data?.signedUrl) {
    throw new Error(`download failed: ${error?.message || bucket}/${path}`)
  }

  const res = await fetch(data.signedUrl)
  if (!res.ok || !res.body) {
    throw new Error(`download failed (${res.status}): ${bucket}/${path}`)
  }

  const file = await open(destPath, 'w')
  let bytes = 0
  try {
    const reader = res.body.getReader()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      await file.write(value)
      bytes += value.byteLength
    }
  } finally {
    await file.close()
  }
  return bytes
}

export async function downloadUrlToFile(url: string, destPath: string): Promise<number> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('logo_fetch_failed')
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(destPath, buf)
  return buf.length
}

/** Uploads the rendered MP4 in resumable chunks read straight from disk. */
export async function uploadProcessedVideo(
  db: SupabaseClient,
  path: string,
  filePath: string,
): Promise<number> {
  const { data, error } = await db.storage.from(SOCIAL_VIDEO_BUCKET).createSignedUploadUrl(path)
  if (error || !data?.token) throw new Error(`upload failed: ${error?.message || 'no token'}`)

  const file = await open(filePath, 'r')
  try {
    const { size } = await file.stat()
    await uploadResumableSigned({
      endpoint: signedResumableEndpoint(new URL(data.signedUrl).origin),
      token: data.token,
      bucket: SOCIAL_VIDEO_BUCKET,
      objectName: data.path || path,
      contentType: 'video/mp4',
      size,
      readChunk: async (start, end) => {
        const chunk = Buffer.alloc(end - start)
        const { bytesRead } = await file.read(chunk, 0, chunk.length, start)
        return new Blob([chunk.subarray(0, bytesRead)])
      },
    })
    return size
  } finally {
    await file.close()
  }
}
