// ============================================================
// lib/social/x/xApi.ts
// X API v2 calls used by Vendl: account, image upload, create post.
// ============================================================

import { X_API_BASE } from '@/lib/social/x/xConfig'

const IMAGE_MAX_BYTES = 5 * 1024 * 1024

export type XAccount = {
  id: string
  username: string
  profileImageUrl: string | null
}

type XErrorBody = { detail?: string; title?: string; errors?: { message?: string }[] }

async function xRequest<T>(accessToken: string, path: string, init?: { method: 'POST'; body: BodyInit; json?: boolean }): Promise<T> {
  const res = await fetch(`${X_API_BASE}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.json ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body,
  })
  const text = await res.text()
  if (!res.ok) {
    let message = `X request failed (${res.status})`
    try {
      const body = JSON.parse(text) as XErrorBody
      message = body.detail || body.errors?.[0]?.message || body.title || message
    } catch {
      // Non-JSON error body: keep the status message.
    }
    console.error('[X] API error', { path, status: res.status, message })
    throw new Error(message)
  }
  return JSON.parse(text) as T
}

export async function getXAccount(accessToken: string): Promise<XAccount> {
  const json = await xRequest<{ data?: { id: string; username: string; profile_image_url?: string } }>(
    accessToken,
    '/2/users/me?user.fields=profile_image_url',
  )
  if (!json.data) throw new Error('X did not return the account')
  return { id: json.data.id, username: json.data.username, profileImageUrl: json.data.profile_image_url ?? null }
}

async function downloadImage(imageUrl: string): Promise<Blob> {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Could not download the image for X (${res.status})`)
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw new Error('The post image is not an image file')
  const blob = await res.blob()
  if (blob.size > IMAGE_MAX_BYTES) throw new Error('Image is over 5 MB, which X does not accept')
  return blob
}

/** Upload one image and return its media id. */
export async function uploadXImage(accessToken: string, imageUrl: string): Promise<string> {
  const form = new FormData()
  form.append('media', await downloadImage(imageUrl), 'image')
  form.append('media_category', 'tweet_image')
  const json = await xRequest<{ data?: { id?: string } }>(accessToken, '/2/media/upload', {
    method: 'POST',
    body: form,
  })
  if (!json.data?.id) throw new Error('X did not return a media id')
  return json.data.id
}

export async function createXPost(accessToken: string, input: { text: string; mediaId: string | null }): Promise<string> {
  const json = await xRequest<{ data?: { id?: string } }>(accessToken, '/2/tweets', {
    method: 'POST',
    json: true,
    body: JSON.stringify({
      text: input.text,
      ...(input.mediaId ? { media: { media_ids: [input.mediaId] } } : {}),
    }),
  })
  if (!json.data?.id) throw new Error('X did not return the post id')
  return json.data.id
}
