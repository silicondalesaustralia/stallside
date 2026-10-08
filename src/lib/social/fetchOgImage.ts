/**
 * Best-effort og:image / twitter:image fetch for inspiration URLs.
 * No scraper - returns null when the page does not expose a usable image URL.
 */

const FETCH_TIMEOUT_MS = 12_000
const MAX_HTML_BYTES = 512_000

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.endsWith('.internal')
  ) {
    return true
  }
  return false
}

export function isSafePublicHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (isBlockedHost(url.hostname)) return false
    return true
  } catch {
    return false
  }
}

function resolveMetaImage(html: string, pageUrl: URL): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]?.trim()) {
      try {
        return new URL(match[1].trim(), pageUrl).href
      } catch {
        continue
      }
    }
  }
  return null
}

export type FetchOgImageResult =
  | { ok: true; imageUrl: string }
  | { ok: false; reason: 'invalid_url' | 'fetch_failed' | 'no_image' }

export async function fetchOgImageFromUrl(pageUrlRaw: string): Promise<FetchOgImageResult> {
  if (!isSafePublicHttpUrl(pageUrlRaw)) {
    return { ok: false, reason: 'invalid_url' }
  }

  const pageUrl = new URL(pageUrlRaw.trim())
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(pageUrl.href, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (compatible; StitchedUpBot/1.0; +https://www.stitchedup.app)',
      },
    })

    if (!res.ok) {
      return { ok: false, reason: 'fetch_failed' }
    }

    const buf = Buffer.from(await res.arrayBuffer())
    const html = buf.slice(0, MAX_HTML_BYTES).toString('utf8')
    const imageUrl = resolveMetaImage(html, pageUrl)
    if (!imageUrl || !isSafePublicHttpUrl(imageUrl)) {
      return { ok: false, reason: 'no_image' }
    }

    return { ok: true, imageUrl }
  } catch {
    return { ok: false, reason: 'fetch_failed' }
  } finally {
    clearTimeout(timer)
  }
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024

/** Download image for one-time vision analysis - not persisted. */
export async function fetchImageBufferForAnalysis(
  imageUrl: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!isSafePublicHttpUrl(imageUrl)) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'image/*',
        'User-Agent':
          'Mozilla/5.0 (compatible; StitchedUpBot/1.0; +https://www.stitchedup.app)',
      },
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
    if (!contentType.startsWith('image/')) return null

    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) return null

    return { buffer: buf, mimeType: contentType }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export function parseDataUrlImage(
  dataUrl: string,
): { buffer: Buffer; mimeType: string } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null
  try {
    const buffer = Buffer.from(match[2], 'base64')
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null
    return { buffer, mimeType: match[1] }
  } catch {
    return null
  }
}
