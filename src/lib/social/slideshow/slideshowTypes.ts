import { SLIDE_BODY_MAX, SLIDE_HEADING_MAX } from '@/lib/social/tiktokSlides/slideTypes'

export const SLIDESHOW_MIN_IMAGES = 3
export const SLIDESHOW_MAX_IMAGES = 10
export const SLIDESHOW_CONTEXT_MAX = 500
export const SLIDESHOW_SECONDS_OPTIONS = [2, 3, 4, 5] as const
export const SLIDESHOW_DEFAULT_SECONDS = 3
export const SLIDESHOW_TRANSITIONS = ['fade', 'slide', 'none'] as const

export type SlideshowTransition = (typeof SLIDESHOW_TRANSITIONS)[number]

export type SlideshowSlide = { imageUrl: string; heading: string; body: string }

export type SlideshowWriteRequest = { images: string[]; context: string; jobId: string | null }

export type SlideshowRenderRequest = {
  slides: SlideshowSlide[]
  jobId: string | null
  secondsPerSlide: number
  transition: SlideshowTransition
  /** Heading underline colour (#RRGGBB); null uses the business brand colour. */
  accentColor: string | null
  /** false = plain photos: no heading, text, underline or business name. */
  showText: boolean
  /** Short summary saved on the Library video so "Write with AI" has context. */
  about: string
}

export type SlideshowWriteResult = { slides: SlideshowSlide[]; caption: string }

export type SlideshowRenderResult = {
  renderJobId: string
  /** Rendered 9:16 JPEG slides, usable as TikTok photo slides. */
  slideUrls: string[]
  coverUrl: string
}

export type SlideshowJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type SlideshowJobView = {
  status: SlideshowJobStatus
  error: string | null
  video: { assetId: string; url: string; thumbnailUrl: string | null; durationSeconds: number | null } | null
}

type Parsed<T> = { ok: true; value: T } | { ok: false; message: string }

function record(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
}

export function clipText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

export function parseAccentColor(value: unknown): string | null {
  const v = typeof value === 'string' ? value.trim() : ''
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : null
}

function parseJobId(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseImages(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((u): u is string => typeof u === 'string' && u.startsWith('https://')).map((u) => u.trim())
}

function countError(count: number): string | null {
  if (count < SLIDESHOW_MIN_IMAGES) return `Pick at least ${SLIDESHOW_MIN_IMAGES} images.`
  if (count > SLIDESHOW_MAX_IMAGES) return `Pick up to ${SLIDESHOW_MAX_IMAGES} images.`
  return null
}

export function parseSlideshowWriteRequest(body: unknown): Parsed<SlideshowWriteRequest> {
  const raw = record(body)
  const images = parseImages(raw.images)
  const error = countError(images.length)
  if (error) return { ok: false, message: error }
  return {
    ok: true,
    value: { images, context: clipText(raw.context, SLIDESHOW_CONTEXT_MAX), jobId: parseJobId(raw.jobId) },
  }
}

export function sanitizeSlide(value: unknown, requireHeading = true): SlideshowSlide | null {
  const raw = record(value)
  const imageUrl = parseImages([raw.imageUrl])[0]
  const heading = clipText(raw.heading, SLIDE_HEADING_MAX)
  if (!imageUrl || (requireHeading && !heading)) return null
  return { imageUrl, heading, body: clipText(raw.body, SLIDE_BODY_MAX) }
}

export function parseSlideshowRenderRequest(body: unknown): Parsed<SlideshowRenderRequest> {
  const raw = record(body)
  const showText = raw.showText !== false
  const list = Array.isArray(raw.slides) ? raw.slides : []
  const slides = list.map((s) => sanitizeSlide(s, showText)).filter((s): s is SlideshowSlide => s !== null)
  if (slides.length !== list.length) return { ok: false, message: 'Every slide needs a heading.' }
  const error = countError(slides.length)
  if (error) return { ok: false, message: error }
  const seconds = Math.round(Number(raw.secondsPerSlide))
  const secondsPerSlide = (SLIDESHOW_SECONDS_OPTIONS as readonly number[]).includes(seconds)
    ? seconds
    : SLIDESHOW_DEFAULT_SECONDS
  const transition = SLIDESHOW_TRANSITIONS.find((t) => t === raw.transition) ?? 'fade'
  return {
    ok: true,
    value: {
      slides,
      jobId: parseJobId(raw.jobId),
      secondsPerSlide,
      transition,
      accentColor: parseAccentColor(raw.accentColor),
      showText,
      about: clipText(raw.about, 2000),
    },
  }
}
