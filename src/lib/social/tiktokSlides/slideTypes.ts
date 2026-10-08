export const TIKTOK_MAX_PHOTO_SLIDES = 35
export const AI_SLIDES_MIN = 3
export const AI_SLIDES_MAX = 10
export const SLIDE_HEADING_MAX = 60
export const SLIDE_BODY_MAX = 180
export const SLIDE_TOPIC_MAX = 300

/** TikTok photo mode is full-screen 9:16; the feed cover is 4:5 so Instagram accepts it. */
export const SLIDE_SIZE = { width: 1080, height: 1920 } as const
export const FEED_COVER_SIZE = { width: 1080, height: 1350 } as const

export type TikTokSlideText = { heading: string; body: string }

export type SlideRequest = {
  topic: string
  slideCount: number
  jobId: string | null
  backgroundUrl: string | null
}

export type SlideDeckResult = {
  slides: string[]
  coverUrl: string
  caption: string
}

function clip(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

export function parseSlideRequest(body: unknown): { ok: true; value: SlideRequest } | { ok: false; message: string } {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const topic = clip(raw.topic, SLIDE_TOPIC_MAX)
  if (topic.length < 3) return { ok: false, message: 'Tell us what the slides should be about.' }
  const count = Math.round(Number(raw.slideCount))
  const slideCount = Number.isFinite(count)
    ? Math.min(AI_SLIDES_MAX, Math.max(AI_SLIDES_MIN, count))
    : 5
  const jobId = typeof raw.jobId === 'string' && raw.jobId.trim() ? raw.jobId.trim() : null
  const backgroundUrl =
    typeof raw.backgroundUrl === 'string' && raw.backgroundUrl.trim() ? raw.backgroundUrl.trim() : null
  return { ok: true, value: { topic, slideCount, jobId, backgroundUrl } }
}

/** Validate LLM output: exactly `count` slides with non-empty headings. */
export function sanitizeSlideTexts(raw: unknown, count: number): TikTokSlideText[] | null {
  if (!Array.isArray(raw)) return null
  const slides = raw
    .map((item) => {
      const obj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return { heading: clip(obj.heading, SLIDE_HEADING_MAX), body: clip(obj.body, SLIDE_BODY_MAX) }
    })
    .filter((s) => s.heading)
  return slides.length >= Math.min(count, AI_SLIDES_MIN) ? slides.slice(0, count) : null
}
