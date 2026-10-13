// ============================================================
// lib/social/pinterest/pinterestOAuth.ts
// Pinterest OAuth: authorize URL, code exchange, refresh.
// ============================================================

import { PINTEREST_SCOPES, requirePinterestCredentials } from '@/lib/social/pinterest/pinterestConfig'

/** Token exchange is always on the production host, even when pins go to the sandbox. */
const PINTEREST_TOKEN_URL = 'https://api.pinterest.com/v5/oauth/token'

export type PinterestTokenResponse = {
  access_token: string
  expires_in: number
  scope: string
  refresh_token?: string
}

type TokenErrorBody = Partial<PinterestTokenResponse> & { code?: number; message?: string }

export function getPinterestOAuthUrl(state: string, redirectUri: string): string {
  const { appId } = requirePinterestCredentials()
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: PINTEREST_SCOPES.join(','),
    state,
  })
  return `https://www.pinterest.com/oauth/?${params.toString()}`
}

/** Pinterest returns scopes space- or comma-separated depending on the endpoint version. */
export function parsePinterestScopes(scope: string): string[] {
  return scope.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
}

function parseTokenBody(text: string): TokenErrorBody {
  try {
    return JSON.parse(text) as TokenErrorBody
  } catch {
    return {}
  }
}

async function postTokenForm(body: Record<string, string>): Promise<PinterestTokenResponse> {
  const { appId, appSecret } = requirePinterestCredentials()
  const res = await fetch(PINTEREST_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  })
  const json = parseTokenBody(await res.text())
  if (!res.ok || !json.access_token) {
    console.error('[Pinterest] Token request failed', { status: res.status, code: json.code })
    throw new Error(json.message || `Pinterest token request failed (${res.status})`)
  }
  return json as PinterestTokenResponse
}

export async function exchangePinterestCode(code: string, redirectUri: string): Promise<PinterestTokenResponse> {
  return postTokenForm({ grant_type: 'authorization_code', code, redirect_uri: redirectUri })
}

export async function refreshPinterestToken(refreshToken: string): Promise<PinterestTokenResponse> {
  return postTokenForm({ grant_type: 'refresh_token', refresh_token: refreshToken })
}

/** Column values for businesses after a token exchange or refresh. Keeps the stored refresh token if omitted. */
export function pinterestTokenColumns(token: PinterestTokenResponse, now = Date.now()) {
  return {
    pinterest_access_token: token.access_token,
    ...(token.refresh_token ? { pinterest_refresh_token: token.refresh_token } : {}),
    pinterest_token_expires_at: new Date(now + token.expires_in * 1000).toISOString(),
    pinterest_scopes: parsePinterestScopes(token.scope).join(' '),
  }
}
