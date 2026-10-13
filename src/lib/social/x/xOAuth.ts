// ============================================================
// lib/social/x/xOAuth.ts
// X OAuth 2.0 (PKCE, confidential client): authorize URL, code exchange, refresh.
// ============================================================

import { createHash, randomBytes } from 'node:crypto'
import { X_API_BASE, X_SCOPES, requireXCredentials } from '@/lib/social/x/xConfig'

export type XTokenResponse = {
  access_token: string
  expires_in: number
  scope: string
  refresh_token?: string
}

type TokenErrorBody = Partial<XTokenResponse> & { error?: string; error_description?: string }

/** PKCE verifier (kept server-side in an httpOnly cookie) and its S256 challenge. */
export function createXPkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(48).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function getXOAuthUrl(state: string, redirectUri: string, codeChallenge: string): string {
  const { clientId } = requireXCredentials()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: X_SCOPES.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  return `https://x.com/i/oauth2/authorize?${params.toString()}`
}

export function parseXScopes(scope: string): string[] {
  return scope.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
}

function parseTokenBody(text: string): TokenErrorBody {
  try {
    return JSON.parse(text) as TokenErrorBody
  } catch {
    return {}
  }
}

async function postTokenForm(body: Record<string, string>): Promise<XTokenResponse> {
  const { clientId, clientSecret } = requireXCredentials()
  const res = await fetch(`${X_API_BASE}/2/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  })
  const json = parseTokenBody(await res.text())
  if (!res.ok || !json.access_token) {
    console.error('[X] Token request failed', { status: res.status, error: json.error })
    throw new Error(json.error_description || json.error || `X token request failed (${res.status})`)
  }
  return json as XTokenResponse
}

export async function exchangeXCode(code: string, redirectUri: string, codeVerifier: string): Promise<XTokenResponse> {
  return postTokenForm({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, code_verifier: codeVerifier })
}

export async function refreshXToken(refreshToken: string): Promise<XTokenResponse> {
  return postTokenForm({ grant_type: 'refresh_token', refresh_token: refreshToken })
}

/** Best effort: revoke on disconnect so the token stops working straight away. */
export async function revokeXToken(token: string): Promise<void> {
  const { clientId, clientSecret } = requireXCredentials()
  const res = await fetch(`${X_API_BASE}/2/oauth2/revoke`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ token, token_type_hint: 'access_token' }).toString(),
  })
  if (!res.ok) console.error('[X] Token revoke failed', { status: res.status })
}

/** Column values for businesses after a token exchange or refresh (X rotates the refresh token). */
export function xTokenColumns(token: XTokenResponse, now = Date.now()) {
  return {
    x_access_token: token.access_token,
    ...(token.refresh_token ? { x_refresh_token: token.refresh_token } : {}),
    x_token_expires_at: new Date(now + token.expires_in * 1000).toISOString(),
    x_scopes: parseXScopes(token.scope).join(' '),
  }
}
