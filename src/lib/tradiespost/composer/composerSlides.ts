import { TIKTOK_MAX_PHOTO_SLIDES, type SlideDeckResult } from '@/lib/social/tiktokSlides/slideTypes'

export type SlideMedia = {
  url: string
  renderId: string | null
  aiGenerated: boolean
  video?: { url: string; durationSeconds: number | null } | null
  slides?: string[] | null
  slidesKind?: 'photos' | 'ai'
}

/** Current TikTok slide list for a photo post ([] for video / no media). */
export function slideList(media: SlideMedia | null): string[] {
  if (!media || media.video) return []
  return media.slides?.length ? media.slides : [media.url]
}

function withSlides<T extends SlideMedia>(media: T, slides: string[]): T | null {
  if (!slides.length) return null
  const kind = media.slidesKind ?? 'photos'
  if (kind === 'photos' && slides.length === 1) {
    return { ...media, url: slides[0], slides: null, slidesKind: undefined }
  }
  return { ...media, url: kind === 'photos' ? slides[0] : media.url, slides, slidesKind: kind }
}

export function addSlide<T extends SlideMedia>(media: T | null, url: string, blank: () => T): T | null {
  if (!media || media.video) return { ...blank(), url }
  const current = slideList(media)
  if (current.length >= TIKTOK_MAX_PHOTO_SLIDES) return media
  return withSlides(media, [...current, url])
}

export function moveSlide<T extends SlideMedia>(media: T, index: number, delta: -1 | 1): T {
  const slides = [...slideList(media)]
  const target = index + delta
  if (target < 0 || target >= slides.length) return media
  ;[slides[index], slides[target]] = [slides[target], slides[index]]
  return withSlides(media, slides) ?? media
}

export function removeSlide<T extends SlideMedia>(media: T, index: number): T | null {
  return withSlides(media, slideList(media).filter((_, i) => i !== index))
}

/** Rebuild composer media from a saved post (Duplicate), keeping TikTok slides. */
export function mediaFromSavedPost(coverUrl: string | null, processed: Record<string, string[]> | null): SlideMedia | null {
  if (!coverUrl) return null
  const media: SlideMedia = { url: coverUrl, renderId: null, aiGenerated: false }
  const slides = processed?.tiktok
  if (!Array.isArray(slides) || slides.length < 2) return media
  return { ...media, slides, slidesKind: slides[0] === coverUrl ? 'photos' : 'ai' }
}

export function mediaFromDeck<T extends SlideMedia>(deck: SlideDeckResult, blank: () => T): T {
  return { ...blank(), url: deck.coverUrl, slides: deck.slides, slidesKind: 'ai' }
}
