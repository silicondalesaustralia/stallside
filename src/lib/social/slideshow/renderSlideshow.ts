import type { SupabaseClient } from '@supabase/supabase-js'
import { buildSlideSvg, safeBrandColor } from '@/lib/social/tiktokSlides/slideSvg'
import { svgToPng } from '@/lib/social/tiktokSlides/renderSlides'
import { FEED_COVER_SIZE, SLIDE_SIZE } from '@/lib/social/tiktokSlides/slideTypes'
import { fetchSlideshowImage } from '@/lib/social/slideshow/slideshowImages'
import type { SlideshowSlide } from '@/lib/social/slideshow/slideshowTypes'

const BUCKET = 'social-posts'

type Size = { width: number; height: number }

export type RenderedSlideshow = {
  /** Storage paths in social-posts, in slide order (the worker reads these). */
  slidePaths: string[]
  slideUrls: string[]
  coverUrl: string
}

async function compositeJpeg(photo: Buffer, overlay: Buffer | null, size: Size): Promise<Buffer> {
  const { default: sharp } = await import('sharp')
  return sharp(photo)
    .rotate()
    .resize(size.width, size.height, { fit: 'cover', position: 'attention' })
    .composite(overlay ? [{ input: overlay }] : [])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

const UPLOAD_ATTEMPTS = 3

/** Storage sometimes answers a valid upload with a bare 5xx ("<none>"); those are worth retrying. */
function isRetryable(status: unknown): boolean {
  return typeof status !== 'number' || status >= 500
}

async function upload(storage: SupabaseClient, path: string, data: Buffer): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    // upsert on retries: a failed attempt may still have written the object.
    const { error } = await storage.storage
      .from(BUCKET)
      .upload(path, data, { contentType: 'image/jpeg', upsert: attempt > 1 })
    if (!error) break
    const status = (error as { status?: unknown }).status
    console.warn('[Slideshow] slide upload failed', { path, attempt, status, message: error.message })
    if (attempt >= UPLOAD_ATTEMPTS || !isRetryable(status)) {
      throw new Error(`Slide upload failed (${String(status ?? 'no status')}): ${error.message}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
  }
  return storage.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Each slide's own photo with its text on top, as 1080x1920 JPEGs, plus a 4:5 feed cover. */
export async function renderSlideshowImages(input: {
  storage: SupabaseClient
  businessId: string
  businessName: string
  brandColor: string | null
  slides: SlideshowSlide[]
  showText: boolean
}): Promise<RenderedSlideshow> {
  const folder = `${input.businessId}/slideshows/${Date.now()}`
  const photos = await Promise.all(input.slides.map((s) => fetchSlideshowImage(s.imageUrl)))
  const base = {
    brandColor: safeBrandColor(input.brandColor),
    businessName: input.businessName,
    overPhoto: true,
    total: input.slides.length,
  }

  const slidePaths: string[] = []
  const slideUrls: string[] = []
  for (const [index, slide] of input.slides.entries()) {
    const overlay = input.showText
      ? svgToPng(buildSlideSvg({ ...base, ...SLIDE_SIZE, slide, index, showCounter: false }))
      : null
    const jpeg = await compositeJpeg(photos[index], overlay, SLIDE_SIZE)
    const path = `${folder}/slide-${index + 1}.jpg`
    slideUrls.push(await upload(input.storage, path, jpeg))
    slidePaths.push(path)
  }

  const coverOverlay = input.showText
    ? svgToPng(buildSlideSvg({ ...base, ...FEED_COVER_SIZE, slide: input.slides[0], index: 0, showCounter: false }))
    : null
  const cover = await compositeJpeg(photos[0], coverOverlay, FEED_COVER_SIZE)
  const coverUrl = await upload(input.storage, `${folder}/cover.jpg`, cover)

  return { slidePaths, slideUrls, coverUrl }
}
