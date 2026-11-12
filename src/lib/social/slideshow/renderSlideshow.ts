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

async function compositeJpeg(photo: Buffer, overlay: Buffer, size: Size): Promise<Buffer> {
  const { default: sharp } = await import('sharp')
  return sharp(photo)
    .rotate()
    .resize(size.width, size.height, { fit: 'cover', position: 'attention' })
    .composite([{ input: overlay }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

async function upload(storage: SupabaseClient, path: string, data: Buffer): Promise<string> {
  const { error } = await storage.storage.from(BUCKET).upload(path, data, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(`Slide upload failed: ${error.message}`)
  return storage.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Each slide's own photo with its text on top, as 1080x1920 JPEGs, plus a 4:5 feed cover. */
export async function renderSlideshowImages(input: {
  storage: SupabaseClient
  businessId: string
  businessName: string
  brandColor: string | null
  slides: SlideshowSlide[]
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
    const svg = buildSlideSvg({ ...base, ...SLIDE_SIZE, slide, index, showCounter: false })
    const jpeg = await compositeJpeg(photos[index], svgToPng(svg), SLIDE_SIZE)
    const path = `${folder}/slide-${index + 1}.jpg`
    slideUrls.push(await upload(input.storage, path, jpeg))
    slidePaths.push(path)
  }

  const coverSvg = buildSlideSvg({ ...base, ...FEED_COVER_SIZE, slide: input.slides[0], index: 0, showCounter: false })
  const cover = await compositeJpeg(photos[0], svgToPng(coverSvg), FEED_COVER_SIZE)
  const coverUrl = await upload(input.storage, `${folder}/cover.jpg`, cover)

  return { slidePaths, slideUrls, coverUrl }
}
