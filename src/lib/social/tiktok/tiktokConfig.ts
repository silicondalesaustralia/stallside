import { productPublicOrigin } from '@/lib/products/productRedirect'
import { resolveKnownProductFromHostname } from '@/lib/products/resolveProductContext'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'

export const TIKTOK_SCOPES = ['user.info.basic', 'video.publish']

export function isTikTokConnectEnabled(): boolean {
  return process.env.TIKTOK_CONNECT_ENABLED === 'true'
}

/** Demo connect without live TikTok credentials. */
export function canUseTikTokConnectDemo(): boolean {
  return isSocialDemoMode() && !isTikTokConnectEnabled()
}

export function requireTikTokCredentials(): { clientKey: string; clientSecret: string } {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim()
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim()
  if (!clientKey || !clientSecret) {
    throw new Error('[TikTok] TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET are not set.')
  }
  return { clientKey, clientSecret }
}

/**
 * Each value must be registered as a Login Kit redirect URI in the TikTok app:
 *   https://www.tradiespost.app/api/social/connect/tiktok/callback
 *   https://www.stitchedup.app/api/social/connect/tiktok/callback
 */
export function tiktokOAuthRedirectUri(requestHostname: string): string {
  const product = resolveKnownProductFromHostname(requestHostname) ?? 'tradiespost'
  return `${productPublicOrigin(product)}/api/social/connect/tiktok/callback`
}

/**
 * Photo posts use PULL_FROM_URL, which TikTok only accepts from a verified URL prefix.
 * Media is proxied through this origin (verified in the TikTok developer portal).
 */
export function tiktokMediaOrigin(): string {
  return productPublicOrigin('tradiespost')
}
