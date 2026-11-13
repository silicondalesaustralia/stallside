// ============================================================
// lib/social/x/xVideo.ts
// Chunked video upload for X (API v2): initialize -> append -> finalize -> poll status.
// ============================================================

import { xRequest } from '@/lib/social/x/xApi'

const VIDEO_MAX_BYTES = 512 * 1024 * 1024
const CHUNK_BYTES = 4 * 1024 * 1024
const STATUS_TIMEOUT_MS = 120_000

type ProcessingInfo = {
  state?: 'pending' | 'in_progress' | 'succeeded' | 'failed'
  check_after_secs?: number
  error?: { message?: string }
}
type MediaResponse = { data?: { id?: string; processing_info?: ProcessingInfo } }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function downloadVideo(videoUrl: string): Promise<{ bytes: Uint8Array<ArrayBuffer>; type: string }> {
  const res = await fetch(videoUrl)
  if (!res.ok) throw new Error(`Could not download the video for X (${res.status})`)
  const type = (res.headers.get('content-type') ?? 'video/mp4').split(';')[0].trim()
  if (!type.startsWith('video/')) throw new Error('The post video is not a video file')
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes.byteLength > VIDEO_MAX_BYTES) throw new Error('Video is over 512 MB, which X does not accept')
  return { bytes, type }
}

async function waitForProcessing(accessToken: string, mediaId: string, first: ProcessingInfo | undefined): Promise<void> {
  let info = first
  const deadline = Date.now() + STATUS_TIMEOUT_MS
  while (info && info.state !== 'succeeded') {
    if (info.state === 'failed') throw new Error(info.error?.message || 'X could not process the video')
    if (Date.now() > deadline) throw new Error('X took too long to process the video')
    await wait(Math.max(1, info.check_after_secs ?? 2) * 1000)
    const status = await xRequest<MediaResponse>(
      accessToken,
      `/2/media/upload?command=STATUS&media_id=${encodeURIComponent(mediaId)}`,
    )
    info = status.data?.processing_info
  }
}

/** Upload a video in chunks and return its media id once X has processed it. */
export async function uploadXVideo(accessToken: string, videoUrl: string): Promise<string> {
  const { bytes, type } = await downloadVideo(videoUrl)

  const init = await xRequest<MediaResponse>(accessToken, '/2/media/upload/initialize', {
    method: 'POST',
    json: true,
    body: JSON.stringify({ media_type: type, total_bytes: bytes.byteLength, media_category: 'tweet_video' }),
  })
  const mediaId = init.data?.id
  if (!mediaId) throw new Error('X did not return a media id')

  for (let offset = 0, index = 0; offset < bytes.byteLength; offset += CHUNK_BYTES, index += 1) {
    const form = new FormData()
    form.append('media', new Blob([bytes.subarray(offset, offset + CHUNK_BYTES)], { type }), 'video')
    form.append('segment_index', String(index))
    await xRequest(accessToken, `/2/media/upload/${encodeURIComponent(mediaId)}/append`, { method: 'POST', body: form })
  }

  const finalized = await xRequest<MediaResponse>(accessToken, `/2/media/upload/${encodeURIComponent(mediaId)}/finalize`, {
    method: 'POST',
    body: '',
  })
  await waitForProcessing(accessToken, mediaId, finalized.data?.processing_info)
  return mediaId
}
