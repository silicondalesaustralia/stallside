export interface StockPhoto {
  id:               string
  thumbnailUrl:     string
  fullUrl:          string
  photographerName: string
  photographerUrl:  string | null
  source:           'unsplash' | 'pexels'
}

export function unsplashAttributionUrl(userHtml: string): string {
  if (!userHtml) return ''
  try {
    const url = new URL(userHtml)
    url.searchParams.set('utm_source', 'stitchedup')
    url.searchParams.set('utm_medium', 'referral')
    return url.toString()
  } catch {
    return userHtml
  }
}
