import { socialIntegrationsReturnUrl } from '@/lib/products/productRoutes'
import type { ProductId } from '@/lib/products/productTypes'

export function isMetaConnectEnabled(): boolean {
  return process.env.META_CONNECT_ENABLED === 'true'
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
