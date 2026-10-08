// ============================================================
// lib/social/tiktok/tiktokApi.ts
// Thin fetch wrappers for open.tiktokapis.com v2.
// ============================================================

export const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2'

type TikTokEnvelope<T> = {
  data?: T
  error?: { code?: string; message?: string; log_id?: string }
}

export class TikTokApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'TikTokApiError'
  }
}

async function parseEnvelope<T>(res: Response, path: string): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as TikTokEnvelope<T>
  const code = json.error?.code ?? (res.ok ? 'ok' : 'http_error')
  if (!res.ok || code !== 'ok') {
    const message = json.error?.message || `TikTok request failed (${res.status})`
    console.error('[TikTok] API error', { path, status: res.status, code, logId: json.error?.log_id })
    throw new TikTokApiError(message, code, res.status)
  }
  return (json.data ?? {}) as T
}

/** Authenticated JSON POST (Content Posting API). */
export async function tiktokPost<T>(path: string, accessToken: string, body: unknown): Promise<T> {
  const res = await fetch(`${TIKTOK_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(body ?? {}),
  })
  return parseEnvelope<T>(res, path)
}

/** Authenticated GET (Display API, e.g. user info). */
export async function tiktokGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${TIKTOK_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return parseEnvelope<T>(res, path)
}

export type TikTokTokenResponse = {
  access_token: string
  expires_in: number
  open_id: string
  refresh_token: string
  refresh_expires_in: number
  scope: string
}

/** OAuth endpoints are form-encoded and return tokens at the top level (no envelope). */
export async function tiktokOAuthForm<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`${TIKTOK_API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok || typeof json.error === 'string') {
    const message =
      (typeof json.error_description === 'string' && json.error_description) ||
      (typeof json.error === 'string' && json.error) ||
      `TikTok OAuth request failed (${res.status})`
    console.error('[TikTok] OAuth error', { path, status: res.status, logId: json.log_id })
    throw new TikTokApiError(message, String(json.error ?? 'oauth_error'), res.status)
  }
  return json as T
}
