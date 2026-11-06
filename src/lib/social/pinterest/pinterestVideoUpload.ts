// ============================================================
// lib/social/pinterest/pinterestVideoUpload.ts
// Video Pins: register media, upload to Pinterest's storage,
// then poll until processing finishes.
// ============================================================

import { contentTarget, pinterestRequest } from '@/lib/social/pinterest/pinterestApi'

export type PinterestMediaStatus = 'registered' | 'processing' | 'succeeded' | 'failed'

type RegisterResponse = {
  media_id: string
  upload_url: string
  upload_parameters: Record<string, string>
}

const POLL_INTERVAL_MS = 3_000

export async function registerPinterestVideo(accessToken: string): Promise<RegisterResponse> {
  return pinterestRequest<RegisterResponse>(contentTarget(accessToken), '/media', {
    method: 'POST',
    body: { media_type: 'video' },
  })
}

/** Multipart POST to the storage URL; the signed fields must come before the file. */
export async function uploadPinterestVideoBytes(
  registration: RegisterResponse,
  bytes: Uint8Array<ArrayBuffer>,
  mimeType: string,
): Promise<void> {
  const form = new FormData()
  for (const [key, value] of Object.entries(registration.upload_parameters)) form.append(key, value)
  form.append('file', new Blob([bytes], { type: mimeType }), 'video')
  const res = await fetch(registration.upload_url, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Pinterest video upload failed (${res.status}) ${text.slice(0, 200)}`)
  }
}

export async function getPinterestMediaStatus(accessToken: string, mediaId: string): Promise<PinterestMediaStatus> {
  const json = await pinterestRequest<{ status?: string }>(
    contentTarget(accessToken),
    `/media/${encodeURIComponent(mediaId)}`,
  )
  const status = json.status
  return status === 'succeeded' || status === 'failed' || status === 'processing' ? status : 'registered'
}

/** Polls until Pinterest finishes or the budget runs out (then the cron picks it up). */
export async function waitForPinterestMedia(
  accessToken: string,
  mediaId: string,
  budgetMs: number,
): Promise<PinterestMediaStatus> {
  const deadline = Date.now() + budgetMs
  let status = await getPinterestMediaStatus(accessToken, mediaId)
  while ((status === 'registered' || status === 'processing') && Date.now() + POLL_INTERVAL_MS < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    status = await getPinterestMediaStatus(accessToken, mediaId)
  }
  return status
}
