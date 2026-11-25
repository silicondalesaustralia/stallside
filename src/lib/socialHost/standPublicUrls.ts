import { SITE_URL } from '@/lib/legal'
import { productRelativePath } from '@/lib/catalogue/main-category'

/**
 * Sync fallbacks for social-host payloads. Prefer async `productPublicUrl` /
 * `storefrontPublicUrl` in dashboard code so the host is the seller subdomain.
 */
export function standShopUrl(standSlug: string): string {
  return `${SITE_URL}/s/${standSlug}`
}

/** Path-only product URL on a known shop host; use with the storefront origin. */
export function productPagePath(productSlug: string, categorySlug?: string | null): string {
  return productRelativePath(productSlug, categorySlug)
}

/** @deprecated Prefer storefront subdomain + productPagePath. */
export function productPageUrl(standSlug: string, productSlug: string): string {
  return `${standShopUrl(standSlug)}/${productSlug}`
}
