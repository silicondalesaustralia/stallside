import { SITE_URL } from '@/lib/legal'

/** Public shop home for a stand: /s/{standSlug}. */
export function standShopUrl(standSlug: string): string {
  return `${SITE_URL}/s/${standSlug}`
}

/** Public product page: /s/{standSlug}/{productSlug}. */
export function productPageUrl(standSlug: string, productSlug: string): string {
  return `${standShopUrl(standSlug)}/${productSlug}`
}
