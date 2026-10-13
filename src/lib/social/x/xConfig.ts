import { productPublicOrigin } from '@/lib/products/productRedirect'
import { resolveKnownProductFromHostname } from '@/lib/products/resolveProductContext'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'
import { envFlag } from '@/lib/social/envFlag'

export const X_SCOPES = ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access']
export const X_API_BASE = 'https://api.x.com'

export function isXConnectEnabled(): boolean {
  return envFlag(process.env.X_CONNECT_ENABLED)
}

/** Demo connect without live X credentials. */
export function canUseXConnectDemo(): boolean {
  return isSocialDemoMode() && !isXConnectEnabled()
}

/** OAuth 2.0 client (User authentication settings), not the v1.1 consumer key/secret. */
export function requireXCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.X_CLIENT_ID?.trim()
  const clientSecret = process.env.X_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error('[X] X_CLIENT_ID / X_CLIENT_SECRET are not set.')
  }
  return { clientId, clientSecret }
}

/**
 * Must be registered as a callback URI on the X app, e.g.
 *   https://www.vendl.app/api/social/connect/x/callback
 */
export function xOAuthRedirectUri(requestHostname: string): string {
  const product = resolveKnownProductFromHostname(requestHostname) ?? 'tradiespost'
  return `${productPublicOrigin(product)}/api/social/connect/x/callback`
}
