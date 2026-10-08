// ============================================================
// lib/social/tiktok/tiktokOAuth.ts
// TikTok Login Kit (web): authorize URL, code exchange, refresh,
// revoke, and basic profile.
// ============================================================

import {
  tiktokGet,
  tiktokOAuthForm,
  type TikTokTokenResponse,
} from '@/lib/social/tiktok/tiktokApi'
import { TIKTOK_SCOPES, requireTikTokCredentials } from '@/lib/social/tiktok/tiktokConfig'

export function getTikTokOAuthUrl(state: string, redirectUri: string): string {
  const { clientKey } = requireTikTokCredentials()
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPES.join(','),
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  })
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
}

export async function exchangeTikTokCode(
  code: string,
  redirectUri: string,
): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret } = requireTikTokCredentials()
  return tiktokOAuthForm<TikTokTokenResponse>('/oauth/token/', {
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })
}

/** Refresh tokens rotate - always persist the returned refresh_token. */
export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret } = requireTikTokCredentials()
  return tiktokOAuthForm<TikTokTokenResponse>('/oauth/token/', {
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
}

export async function revokeTikTokToken(accessToken: string): Promise<void> {
  const { clientKey, clientSecret } = requireTikTokCredentials()
  await tiktokOAuthForm<Record<string, unknown>>('/oauth/revoke/', {
    client_key: clientKey,
    client_secret: clientSecret,
    token: accessToken,
  })
}

export type TikTokUserInfo = {
  open_id: string
  display_name?: string
  avatar_url?: string
}

export async function getTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const data = await tiktokGet<{ user?: TikTokUserInfo }>(
    '/user/info/?fields=open_id,display_name,avatar_url',
    accessToken,
  )
  if (!data.user?.open_id) throw new Error('[TikTok] User info returned no open_id')
  return data.user
}

/** Column values for businesses after a token exchange or refresh. */
export function tiktokTokenColumns(token: TikTokTokenResponse, now = Date.now()) {
  return {
    tiktok_access_token: token.access_token,
    tiktok_refresh_token: token.refresh_token,
    tiktok_token_expires_at: new Date(now + token.expires_in * 1000).toISOString(),
    tiktok_refresh_expires_at: new Date(now + token.refresh_expires_in * 1000).toISOString(),
    tiktok_scopes: token.scope,
  }
}
