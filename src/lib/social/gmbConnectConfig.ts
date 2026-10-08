import { appBaseUrl } from '@/lib/team/appBaseUrl'

import { socialIntegrationsReturnUrl } from '@/lib/products/productRoutes'
import type { ProductId } from '@/lib/products/productTypes'

export function isGmbConnectEnabled(): boolean {
  return process.env.GMB_CONNECT_ENABLED === 'true'
}

export function isSocialDemoMode(): boolean {
  return process.env.SOCIAL_DEMO_MODE === 'true'
}

/** Production gate - leave unset/false until GBP Performance quota is confirmed. */
export function isGbpPerformanceEnabled(): boolean {
  return process.env.GBP_PERFORMANCE_ENABLED === 'true'
}

/** Mock dashboard data. Reuses SOCIAL_DEMO_MODE; optional dedicated override. */
export function isGbpPerformanceDemoMode(): boolean {
  return process.env.GBP_PERFORMANCE_DEMO_MODE === 'true' || isSocialDemoMode()
}

/** Flag on, or demo path - never expose the UI when both are off. */
export function canUseGbpPerformance(): boolean {
  return isGbpPerformanceEnabled() || isGbpPerformanceDemoMode()
}

/** Demo OAuth + location picker without live GBP API credentials. */
export function canUseGmbConnectDemo(): boolean {
  return isSocialDemoMode() && !isGmbConnectEnabled()
}

export function gmbIntegrationsBaseUrl(
  requestOrigin?: string,
  returnPath?: string | null,
  product?: ProductId,
): string {
  return socialIntegrationsReturnUrl({ requestOrigin, returnPath, product })
}

export function gmbOAuthRedirectUri(): string {
  const explicit = process.env.GOOGLE_GMB_REDIRECT_URI?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  return `${appBaseUrl()}/api/social/connect/gmb/callback`
}
