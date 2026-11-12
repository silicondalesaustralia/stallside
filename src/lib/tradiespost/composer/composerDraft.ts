import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import { COMPOSER_PUBLISH_PLATFORMS, type SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { TIKTOK_MAX_PHOTO_SLIDES } from '@/lib/social/tiktokSlides/slideTypes'
import { parseSlideshowDraft, slideshowDraftIsEmpty, type SlideshowDraft } from '@/lib/social/slideshow/slideshowDraft'
import {
  EMPTY_PLATFORM_TEXT,
  parsePlatformText,
  platformTextIsEmpty,
  type PlatformTextDraft,
} from '@/lib/tradiespost/composer/platformText'

/** Everything Create needs to come back after a refresh or from a saved draft. */
export type ComposerDraftData = {
  platforms: SocialPublishPlatform[]
  headline: string
  caption: string
  platformText: PlatformTextDraft
  media: ComposerMedia | null
  jobId: string | null
  slideshow: SlideshowDraft | null
}

export type SavedDraftSummary = { id: string; updatedAt: string; caption: string; imageUrl: string | null }

/** Serialized drafts above this are rejected (they are text + URLs only). */
export const COMPOSER_DRAFT_MAX_BYTES = 64_000

export const EMPTY_COMPOSER_DRAFT: ComposerDraftData = {
  platforms: [],
  headline: '',
  caption: '',
  platformText: EMPTY_PLATFORM_TEXT,
  media: null,
  jobId: null,
  slideshow: null,
}

const httpsUrl = (v: unknown): v is string => typeof v === 'string' && v.startsWith('https://')
const optionalId = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 100) : null)

function parseMedia(value: unknown): ComposerMedia | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (!httpsUrl(raw.url)) return null
  const media: ComposerMedia = { url: raw.url, renderId: optionalId(raw.renderId), aiGenerated: raw.aiGenerated === true }
  const video = raw.video as Record<string, unknown> | null | undefined
  if (video && httpsUrl(video.url)) {
    const duration = Number(video.durationSeconds)
    media.video = { url: video.url, durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : null }
  }
  if (optionalId(raw.assetId)) media.assetId = optionalId(raw.assetId)
  const slides = Array.isArray(raw.slides) ? raw.slides.filter(httpsUrl).slice(0, TIKTOK_MAX_PHOTO_SLIDES) : []
  if (slides.length) {
    media.slides = slides
    media.slidesKind = raw.slidesKind === 'ai' ? 'ai' : 'photos'
  }
  return media
}

export function parseComposerDraft(value: unknown): ComposerDraftData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const platforms = (Array.isArray(raw.platforms) ? raw.platforms : []).filter(
    (p): p is SocialPublishPlatform => COMPOSER_PUBLISH_PLATFORMS.includes(p as SocialPublishPlatform),
  )
  const slideshow = parseSlideshowDraft(raw.slideshow)
  return {
    platforms: [...new Set(platforms)],
    headline: typeof raw.headline === 'string' ? raw.headline.slice(0, 300) : '',
    caption: typeof raw.caption === 'string' ? raw.caption.slice(0, 5000) : '',
    platformText: parsePlatformText(raw.platformText),
    media: parseMedia(raw.media),
    jobId: optionalId(raw.jobId),
    slideshow: slideshowDraftIsEmpty(slideshow) ? null : slideshow,
  }
}

/** Nothing worth keeping: no caption, headline, platform text, media or slideshow work. Platforms alone don't count. */
export function composerDraftIsEmpty(draft: ComposerDraftData): boolean {
  return (
    !draft.caption.trim() &&
    !draft.headline.trim() &&
    platformTextIsEmpty(draft.platformText) &&
    !draft.media &&
    slideshowDraftIsEmpty(draft.slideshow)
  )
}

export function summarizeComposerDraft(id: string, updatedAt: string, data: unknown): SavedDraftSummary {
  const draft = parseComposerDraft(data) ?? EMPTY_COMPOSER_DRAFT
  return {
    id,
    updatedAt,
    caption: draft.caption.trim().slice(0, 140),
    imageUrl: draft.media?.url ?? draft.slideshow?.images[0] ?? null,
  }
}
