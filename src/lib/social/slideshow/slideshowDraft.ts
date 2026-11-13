import { SLIDE_BODY_MAX, SLIDE_HEADING_MAX } from '@/lib/social/tiktokSlides/slideTypes'
import {
  SLIDESHOW_CONTEXT_MAX,
  SLIDESHOW_DEFAULT_SECONDS,
  SLIDESHOW_MAX_IMAGES,
  SLIDESHOW_SECONDS_OPTIONS,
  SLIDESHOW_TRANSITIONS,
  parseAccentColor,
  type SlideshowSlide,
  type SlideshowTransition,
} from '@/lib/social/slideshow/slideshowTypes'

/** In-progress Slideshow tab state, saved with composer drafts. 'edit' = AI slides written, not yet created. */
export type SlideshowDraft = {
  stage: 'pick' | 'edit'
  images: string[]
  context: string
  slides: SlideshowSlide[]
  caption: string
  secondsPerSlide: number
  transition: SlideshowTransition
  accentColor: string | null
  showText: boolean
}

export const EMPTY_SLIDESHOW_DRAFT: SlideshowDraft = {
  stage: 'pick',
  images: [],
  context: '',
  slides: [],
  caption: '',
  secondsPerSlide: SLIDESHOW_DEFAULT_SECONDS,
  transition: 'fade',
  accentColor: null,
  showText: true,
}

const httpsUrl = (v: unknown): v is string => typeof v === 'string' && v.startsWith('https://')
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')

/** Lenient: headings may be blank mid-edit (the render route enforces them). */
function draftSlide(value: unknown): SlideshowSlide | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (!httpsUrl(raw.imageUrl)) return null
  return { imageUrl: raw.imageUrl, heading: text(raw.heading, SLIDE_HEADING_MAX), body: text(raw.body, SLIDE_BODY_MAX) }
}

export function parseSlideshowDraft(value: unknown): SlideshowDraft | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const images = (Array.isArray(raw.images) ? raw.images : []).filter(httpsUrl).slice(0, SLIDESHOW_MAX_IMAGES)
  const slides = (Array.isArray(raw.slides) ? raw.slides : [])
    .map(draftSlide)
    .filter((s): s is SlideshowSlide => s !== null)
    .slice(0, SLIDESHOW_MAX_IMAGES)
  const seconds = Number(raw.secondsPerSlide)
  return {
    stage: raw.stage === 'edit' && slides.length ? 'edit' : 'pick',
    images,
    context: text(raw.context, SLIDESHOW_CONTEXT_MAX),
    slides,
    caption: text(raw.caption, 2200),
    secondsPerSlide: (SLIDESHOW_SECONDS_OPTIONS as readonly number[]).includes(seconds) ? seconds : SLIDESHOW_DEFAULT_SECONDS,
    transition: SLIDESHOW_TRANSITIONS.find((t) => t === raw.transition) ?? 'fade',
    accentColor: parseAccentColor(raw.accentColor),
    showText: raw.showText !== false,
  }
}

export function slideshowDraftIsEmpty(draft: SlideshowDraft | null): boolean {
  return !draft || (!draft.images.length && !draft.slides.length && !draft.context.trim())
}
