/**
 * Instagram / Facebook post URLs cannot be previewed by HTML og:image
 * scraping. Meta oEmbed/Graph is not wired (META_APP_ID / META_APP_SECRET
 * unset), so Recreate should send the tradie to Screenshot.
 */

export const META_SOCIAL_PREVIEW_MESSAGE =
  'Instagram and Facebook links cannot be loaded until Meta is connected. Upload a screenshot of the post instead.'

export function isMetaSocialPostUrl(raw: string): boolean {
  try {
    const host = new URL(raw.trim()).hostname.toLowerCase().replace(/^www\./, '')
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return true
    if (host === 'instagr.am' || host.endsWith('.instagr.am')) return true
    if (host === 'facebook.com' || host.endsWith('.facebook.com')) return true
    if (host === 'fb.com' || host.endsWith('.fb.com')) return true
    if (host === 'fb.watch' || host.endsWith('.fb.watch')) return true
    return false
  } catch {
    return false
  }
}
