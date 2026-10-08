// ============================================================
// lib/social/tiktok/tiktokVideoUpload.ts
// FILE_UPLOAD chunk plan + PUT upload. Video uses FILE_UPLOAD
// (not PULL_FROM_URL) so large files never stream through a proxy.
// ============================================================

const MIN_CHUNK = 5 * 1024 * 1024
const TARGET_CHUNK = 10 * 1024 * 1024

export type TikTokChunkPlan = {
  videoSize: number
  chunkSize: number
  totalChunkCount: number
}

/**
 * TikTok rules: chunks 5-64MB, files under 5MB go in one chunk, and the
 * final chunk absorbs the remainder (total = floor(size / chunkSize)).
 */
export function planTikTokChunks(videoSize: number): TikTokChunkPlan {
  if (videoSize <= 0) throw new Error('Video file is empty')
  if (videoSize < MIN_CHUNK || videoSize < TARGET_CHUNK * 2) {
    return { videoSize, chunkSize: videoSize, totalChunkCount: 1 }
  }
  const chunkSize = TARGET_CHUNK
  const totalChunkCount = Math.max(1, Math.floor(videoSize / chunkSize))
  return { videoSize, chunkSize, totalChunkCount }
}

/** Byte range [start, end] inclusive for chunk i. */
export function chunkRange(plan: TikTokChunkPlan, index: number): { start: number; end: number } {
  const start = index * plan.chunkSize
  const isLast = index === plan.totalChunkCount - 1
  const end = isLast ? plan.videoSize - 1 : start + plan.chunkSize - 1
  return { start, end }
}

export async function downloadVideo(url: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not download video (${res.status})`)
  const mimeType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'video/mp4'
  return { bytes: new Uint8Array(await res.arrayBuffer()), mimeType }
}

export async function uploadTikTokChunks(
  uploadUrl: string,
  bytes: Uint8Array,
  mimeType: string,
  plan: TikTokChunkPlan,
): Promise<void> {
  for (let i = 0; i < plan.totalChunkCount; i++) {
    const { start, end } = chunkRange(plan, i)
    const chunk = bytes.slice(start, end + 1)
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(chunk.byteLength),
        'Content-Range': `bytes ${start}-${end}/${plan.videoSize}`,
      },
      body: chunk,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`TikTok video upload failed on chunk ${i + 1} (${res.status}) ${text.slice(0, 200)}`)
    }
  }
}
