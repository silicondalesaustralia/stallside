import { productPublicOrigin } from '@/lib/products/productRedirect'
import { resolveKnownProductFromHostname } from '@/lib/products/resolveProductContext'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
]

export function isYouTubeConnectEnabled(): boolean {
  return process.env.YOUTUBE_CONNECT_ENABLED === 'true'
}

/** Demo connect without live Google credentials. */
export function canUseYouTubeConnectDemo(): boolean {
  return isSocialDemoMode() && !isYouTubeConnectEnabled()
}

/** Dedicated Google OAuth client - separate from Calendar and GMB clients. */
export function requireYouTubeCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_YOUTUBE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_YOUTUBE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error('[YouTube] GOOGLE_YOUTUBE_CLIENT_ID / GOOGLE_YOUTUBE_CLIENT_SECRET are not set.')
  }
  return { clientId, clientSecret }
}

/**
 * Must be registered as an authorised redirect URI on the Google OAuth client, e.g.
 *   https://www.vendl.app/api/social/connect/youtube/callback
 */
export function youtubeOAuthRedirectUri(requestHostname: string): string {
  const product = resolveKnownProductFromHostname(requestHostname) ?? 'tradiespost'
  return `${productPublicOrigin(product)}/api/social/connect/youtube/callback`
}
