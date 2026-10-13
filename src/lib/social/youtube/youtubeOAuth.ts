// ============================================================
// lib/social/youtube/youtubeOAuth.ts
// Google OAuth for YouTube: authorize URL, code exchange,
// refresh, revoke, and the connected channel profile.
// ============================================================

import { YOUTUBE_SCOPES, requireYouTubeCredentials } from '@/lib/social/youtube/youtubeConfig'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export type YouTubeTokenResponse = {
  access_token: string
  expires_in: number
  scope: string
  /** Only returned on the first consent (access_type=offline + prompt=consent). */
  refresh_token?: string
}

export type YouTubeChannel = {
  id: string
  title: string
  thumbnailUrl: string | null
}

type TokenErrorBody = Partial<YouTubeTokenResponse> & { error?: string; error_description?: string }

export function getYouTubeOAuthUrl(state: string, redirectUri: string): string {
  const { clientId } = requireYouTubeCredentials()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

function parseTokenBody(text: string): TokenErrorBody {
  try {
    return JSON.parse(text) as TokenErrorBody
  } catch {
    return {}
  }
}

async function postTokenForm(body: Record<string, string>): Promise<YouTubeTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  })
  const json = parseTokenBody(await res.text())
  if (!res.ok || !json.access_token) {
    console.error('[YouTube] Token request failed', { status: res.status, error: json.error })
    throw new Error(json.error_description || json.error || `Google token request failed (${res.status})`)
  }
  return json as YouTubeTokenResponse
}

export async function exchangeYouTubeCode(code: string, redirectUri: string): Promise<YouTubeTokenResponse> {
  const { clientId, clientSecret } = requireYouTubeCredentials()
  return postTokenForm({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })
}

export async function refreshYouTubeToken(refreshToken: string): Promise<YouTubeTokenResponse> {
  const { clientId, clientSecret } = requireYouTubeCredentials()
  return postTokenForm({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
}

/** Revoking either token revokes the whole grant. */
export async function revokeYouTubeToken(token: string): Promise<void> {
  const res = await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }).toString(),
  })
  if (!res.ok) throw new Error(`Google revoke failed (${res.status})`)
}

/** The authenticated user's own channel, or null when the Google account has none. */
export async function getYouTubeChannel(accessToken: string): Promise<YouTubeChannel | null> {
  const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    console.error('[YouTube] Channel lookup failed', { status: res.status })
    throw new Error(`YouTube channel lookup failed (${res.status})`)
  }
  const json = (await res.json()) as {
    items?: { id: string; snippet?: { title?: string; thumbnails?: { default?: { url?: string } } } }[]
  }
  const item = json.items?.[0]
  if (!item) return null
  return {
    id: item.id,
    title: item.snippet?.title ?? 'YouTube channel',
    thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? null,
  }
}

/** Column values for businesses after a token exchange or refresh. Keeps the stored refresh token if Google omits it. */
export function youtubeTokenColumns(token: YouTubeTokenResponse, now = Date.now()) {
  return {
    youtube_access_token: token.access_token,
    ...(token.refresh_token ? { youtube_refresh_token: token.refresh_token } : {}),
    youtube_token_expires_at: new Date(now + token.expires_in * 1000).toISOString(),
    youtube_scopes: token.scope,
  }
}
