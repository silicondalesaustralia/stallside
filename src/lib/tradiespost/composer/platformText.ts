import {
  COMPOSER_PUBLISH_PLATFORMS,
  type PlatformCaptions,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { facebookCaptionWithHeadline } from '@/lib/tradiespost/composer/composerState'
import { effectiveCaption } from '@/lib/tradiespost/composer/captionLimits'

/** Per-platform text in Create: caption overrides plus the YouTube/Pinterest titles and X text. */
export type PlatformTextDraft = {
  captions: PlatformCaptions
  youtubeTitle: string
  youtubeTags: string
  pinterestTitle: string
  /** null = X follows the main caption. */
  xText: string | null
}

export const EMPTY_PLATFORM_TEXT: PlatformTextDraft = {
  captions: {},
  youtubeTitle: '',
  youtubeTags: '',
  pinterestTitle: '',
  xText: null,
}

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')

export function parsePlatformText(value: unknown): PlatformTextDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_PLATFORM_TEXT
  const raw = value as Record<string, unknown>
  const rawCaptions = (raw.captions && typeof raw.captions === 'object' ? raw.captions : {}) as Record<string, unknown>
  const captions: PlatformCaptions = {}
  for (const platform of COMPOSER_PUBLISH_PLATFORMS) {
    const text = clip(rawCaptions[platform], 5000)
    if (text.trim()) captions[platform] = text
  }
  return {
    captions,
    youtubeTitle: clip(raw.youtubeTitle, 200),
    youtubeTags: clip(raw.youtubeTags, 600),
    pinterestTitle: clip(raw.pinterestTitle, 200),
    xText: typeof raw.xText === 'string' ? raw.xText.slice(0, 1000) : null,
  }
}

export function platformTextIsEmpty(text: PlatformTextDraft): boolean {
  return (
    !Object.values(text.captions).some((c) => c?.trim()) &&
    !text.youtubeTitle.trim() &&
    !text.youtubeTags.trim() &&
    !text.pinterestTitle.trim() &&
    !text.xText?.trim()
  )
}

/** platform_captions for the post: written overrides, Facebook headline, X text. */
export function composerPlatformCaptions(params: {
  selected: SocialPublishPlatform[]
  caption: string
  overrides: PlatformCaptions
  headline: string
  xText: string | null
}): PlatformCaptions {
  const out: PlatformCaptions = {}
  for (const platform of params.selected) {
    const own = params.overrides[platform]?.trim()
    if (own && platform !== 'x') out[platform] = own
  }
  if (params.selected.includes('facebook')) {
    const withHeadline = facebookCaptionWithHeadline(
      params.headline,
      effectiveCaption('facebook', params.caption, params.overrides),
    )
    if (withHeadline) out.facebook = withHeadline
  }
  if (params.xText?.trim() && params.selected.includes('x')) out.x = params.xText.trim()
  return out
}
