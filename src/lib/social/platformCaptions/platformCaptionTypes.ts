import { COMPOSER_PUBLISH_PLATFORMS, type SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { CAPTION_LIMITS, FACEBOOK_HEADLINE_MAX } from '@/lib/tradiespost/composer/composerState'
import { cleanYouTubeTitle } from '@/lib/social/youtube/youtubeSettings'
import { parseYouTubeTags } from '@/lib/social/youtube/youtubeTags'
import { PINTEREST_DESCRIPTION_MAX, tidyPinterestTitle } from '@/lib/social/pinterest/pinterestSettings'
import { X_TEXT_MAX } from '@/lib/social/x/xText'

/** One platform's AI-written text. Only the fields that platform uses are set. */
export type PlatformCopy = { caption: string; headline?: string; title?: string; tags?: string[] }

export type PlatformCaptionsRequest = {
  platforms: SocialPublishPlatform[]
  /** Also write the shared main caption ("Write all"). */
  includeMain: boolean
  /** Current main caption; single-platform writes adapt it when present. */
  mainCaption: string
  jobId: string | null
  renderId: string | null
  assetId: string | null
}

export type PlatformCaptionsResult = {
  main: string | null
  platforms: Partial<Record<SocialPublishPlatform, PlatformCopy>>
}

type Parsed<T> = { ok: true; value: T } | { ok: false; message: string }

const id = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 100) : null)

export function parsePlatformCaptionsRequest(body: unknown): Parsed<PlatformCaptionsRequest> {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const platforms = [
    ...new Set(
      (Array.isArray(raw.platforms) ? raw.platforms : []).filter((p): p is SocialPublishPlatform =>
        COMPOSER_PUBLISH_PLATFORMS.includes(p as SocialPublishPlatform),
      ),
    ),
  ]
  const includeMain = raw.includeMain === true
  if (!platforms.length && !includeMain) return { ok: false, message: 'Pick at least one platform.' }
  return {
    ok: true,
    value: {
      platforms,
      includeMain,
      mainCaption: typeof raw.mainCaption === 'string' ? raw.mainCaption.slice(0, 5000) : '',
      jobId: id(raw.jobId),
      renderId: id(raw.renderId),
      assetId: id(raw.assetId),
    },
  }
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max).trim() : '')

function copyFor(platform: SocialPublishPlatform, raw: Record<string, unknown>): PlatformCopy | null {
  if (platform === 'x') {
    const text = str(raw.caption ?? raw.text, X_TEXT_MAX)
    return text ? { caption: text } : null
  }
  const limit = platform === 'pinterest' ? PINTEREST_DESCRIPTION_MAX : CAPTION_LIMITS[platform]
  const caption = str(raw.caption ?? raw.description, limit)
  if (!caption) return null
  if (platform === 'facebook') return { caption, headline: str(raw.headline, FACEBOOK_HEADLINE_MAX) }
  if (platform === 'youtube') {
    const tags = Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === 'string') : []
    return { caption, title: cleanYouTubeTitle(str(raw.title, 200)), tags: parseYouTubeTags(tags) }
  }
  if (platform === 'pinterest') return { caption, title: tidyPinterestTitle(str(raw.title, 200)) }
  return { caption }
}

/** AI JSON -> clipped, platform-shaped copy. Throws a friendly error when nothing usable came back. */
export function parsePlatformCaptionsReply(text: string, request: PlatformCaptionsRequest): PlatformCaptionsResult {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error('The AI reply was not readable - try again.')
  }
  const byPlatform = (parsed.platforms && typeof parsed.platforms === 'object' ? parsed.platforms : {}) as Record<
    string,
    unknown
  >
  const platforms: PlatformCaptionsResult['platforms'] = {}
  for (const platform of request.platforms) {
    const entry = byPlatform[platform]
    const copy = entry && typeof entry === 'object' ? copyFor(platform, entry as Record<string, unknown>) : null
    if (copy) platforms[platform] = copy
  }
  const main = request.includeMain ? str(parsed.main, CAPTION_LIMITS.instagram) || null : null
  if (!main && !Object.keys(platforms).length) throw new Error('The AI did not write any captions - try again.')
  return { main, platforms }
}
