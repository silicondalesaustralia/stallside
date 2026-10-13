import { productPublicOrigin } from '@/lib/products/productRedirect'
import { resolveKnownProductFromHostname } from '@/lib/products/resolveProductContext'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'
import { envFlag } from '@/lib/social/envFlag'

export const PINTEREST_SCOPES = ['boards:read', 'pins:read', 'pins:write', 'user_accounts:read']

export function isPinterestConnectEnabled(): boolean {
  return envFlag(process.env.PINTEREST_CONNECT_ENABLED)
}

/** Demo connect without live Pinterest credentials. */
export function canUsePinterestConnectDemo(): boolean {
  return isSocialDemoMode() && !isPinterestConnectEnabled()
}

export function requirePinterestCredentials(): { appId: string; appSecret: string } {
  const appId = process.env.PINTEREST_APP_ID?.trim()
  const appSecret = process.env.PINTEREST_APP_SECRET?.trim()
  if (!appId || !appSecret) {
    throw new Error('[Pinterest] PINTEREST_APP_ID / PINTEREST_APP_SECRET are not set.')
  }
  return { appId, appSecret }
}

export const PINTEREST_PRODUCTION_API = 'https://api.pinterest.com'

/**
 * Pins/boards API host. Trial-access apps may only write to the sandbox:
 * set PINTEREST_API_BASE=https://api-sandbox.pinterest.com until Standard access.
 */
export function pinterestApiBase(): string {
  return (process.env.PINTEREST_API_BASE?.trim() || PINTEREST_PRODUCTION_API).replace(/\/$/, '')
}

/** The sandbox rejects OAuth tokens; it only accepts the sandbox token generated on the app page. */
export function pinterestSandboxAccessToken(): string | null {
  return process.env.PINTEREST_SANDBOX_ACCESS_TOKEN?.trim() || null
}

/**
 * Must be registered as a redirect URI on the Pinterest app, e.g.
 *   https://www.vendl.app/api/social/connect/pinterest/callback
 */
export function pinterestOAuthRedirectUri(requestHostname: string): string {
  const product = resolveKnownProductFromHostname(requestHostname) ?? 'tradiespost'
  return `${productPublicOrigin(product)}/api/social/connect/pinterest/callback`
}
