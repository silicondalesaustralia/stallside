import { socialIntegrationsReturnUrl } from '@/lib/products/productRoutes'
import type { ProductId } from '@/lib/products/productTypes'
import { envFlag } from '@/lib/social/envFlag'

export function isMetaConnectEnabled(): boolean {
  return envFlag(process.env.META_CONNECT_ENABLED)
}

export function isSocialDemoMode(): boolean {
  return process.env.SOCIAL_DEMO_MODE === 'true'
}

/** Demo OAuth + page picker without live Meta credentials. */
export function canUseMetaConnectDemo(): boolean {
  return isSocialDemoMode() && !isMetaConnectEnabled()
}

export function integrationsBaseUrl(
  requestOrigin?: string,
  returnPath?: string | null,
  product?: ProductId,
): string {
  return socialIntegrationsReturnUrl({ requestOrigin, returnPath, product })
}
