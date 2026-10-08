// ============================================================
// lib/social/metaOAuth.ts
// Facebook Login for Business: OAuth URL, token exchange, Pages.
// ============================================================

import { META_GRAPH_API_VERSION, graphGet } from '@/lib/social/metaGraphClient'
import { productPublicOrigin } from '@/lib/products/productRedirect'
import { resolveKnownProductFromHostname } from '@/lib/products/resolveProductContext'

export interface MetaPage {
  id: string
  name: string
  access_token: string
  instagram_business_account?: { id: string; username?: string }
}

/**
 * Production www origin of the product the user is on, so the callback lands
 * on the same domain as their login session. Each value must be listed under
 * "Valid OAuth Redirect URIs" in the Meta app:
 *   https://www.tradiespost.app/api/social/connect/meta/callback
 *   https://www.stitchedup.app/api/social/connect/meta/callback
 * Unknown hosts (preview, localhost) fall back to TradiesPost.
 */
export function metaOAuthRedirectUri(requestHostname: string): string {
  const product = resolveKnownProductFromHostname(requestHostname) ?? 'tradiespost'
  return `${productPublicOrigin(product)}/api/social/connect/meta/callback`
}

const FACEBOOK_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'business_management',
  'public_profile',
]

const INSTAGRAM_SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
  'business_management',
  'public_profile',
]

function requireMetaAppCredentials(): { appId: string; appSecret: string } {
  const appId = process.env.META_APP_ID?.trim()
  const appSecret = process.env.META_APP_SECRET?.trim()
  if (!appId || !appSecret) {
    throw new Error('[Meta] META_APP_ID / META_APP_SECRET are not set.')
  }
  return { appId, appSecret }
}

export function getMetaOAuthUrl(
  state: string,
  platform: 'facebook' | 'instagram',
  redirectUri: string,
): string {
  const appId = process.env.META_APP_ID?.trim()
  if (!appId) throw new Error('[Meta] META_APP_ID is not set.')
  const scopes = platform === 'facebook' ? FACEBOOK_SCOPES : INSTAGRAM_SCOPES

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    state,
    response_type: 'code',
  })
  return `https://www.facebook.com/${META_GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`
}

interface TokenResponse {
  access_token: string
}

/**
 * Code → short-lived user token (~1h) → long-lived user token (~60d).
 * Page tokens fetched with a long-lived user token do not expire, so
 * scheduled posts keep publishing after the login session ends.
 */
export async function exchangeMetaCode(
  code: string,
  redirectUri: string,
): Promise<{ accessToken: string }> {
  const { appId, appSecret } = requireMetaAppCredentials()

  const short = await graphGet<TokenResponse>('oauth/access_token', {
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })

  const long = await graphGet<TokenResponse>('oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: short.access_token,
  })

  return { accessToken: long.access_token }
}

export async function getMetaPages(userAccessToken: string): Promise<MetaPage[]> {
  const json = await graphGet<{ data?: MetaPage[] }>('me/accounts', {
    fields: 'id,name,access_token,instagram_business_account{id,username}',
    access_token: userAccessToken,
  })
  return json.data || []
}
