import { Resvg } from '@resvg/resvg-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { assertBundledSocialFontsPresent, bundledSocialFontPaths } from '@/lib/social/bundledSocialFonts'
import { buildSlideSvg, safeBrandColor } from '@/lib/social/tiktokSlides/slideSvg'
import {
  FEED_COVER_SIZE,
  SLIDE_SIZE,
  type TikTokSlideText,
} from '@/lib/social/tiktokSlides/slideTypes'

const BUCKET = 'social-posts'

export type RenderSlidesInput = {
  storage: SupabaseClient
  businessId: string
  businessName: string
  brandColor: string | null
  slides: TikTokSlideText[]
  /** Optional photo used behind every slide. */
  background: Buffer | null
}

function svgToPng(svg: string): Buffer {
  const fonts = assertBundledSocialFontsPresent()
  if (!fonts.ok) throw new Error(`Missing bundled fonts: ${fonts.missing.join(', ')}`)
  const resvg = new Resvg(svg, {
    font: { fontFiles: bundledSocialFontPaths(), loadSystemFonts: false, defaultFontFamily: 'Inter' },
  })
  return Buffer.from(resvg.render().asPng())
}

async function toWebp(
  overlay: Buffer,
  size: { width: number; height: number },
  background: Buffer | null,
): Promise<Buffer> {
  const { default: sharp } = await import('sharp')
  if (!background) return sharp(overlay).webp({ quality: 88 }).toBuffer()
  return sharp(background)
    .rotate()
    .resize(size.width, size.height, { fit: 'cover', position: 'attention' })
    .composite([{ input: overlay }])
    .webp({ quality: 85 })
    .toBuffer()
}

async function upload(storage: SupabaseClient, path: string, data: Buffer): Promise<string> {
  const { error } = await storage.storage.from(BUCKET).upload(path, data, { contentType: 'image/webp', upsert: false })
  if (error) throw new Error(`Slide upload failed: ${error.message}`)
  return storage.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Renders 9:16 TikTok slides plus a 4:5 feed cover (first slide) and uploads all as WebP. */
export async function renderAndStoreSlides(input: RenderSlidesInput): Promise<{ slides: string[]; coverUrl: string }> {
  const brandColor = safeBrandColor(input.brandColor)
  const overPhoto = Boolean(input.background)
  const folder = `${input.businessId}/tiktok-slides/${Date.now()}`
  const base = {
    brandColor,
    businessName: input.businessName,
    overPhoto,
    total: input.slides.length,
  }

  const slides: string[] = []
  for (const [index, slide] of input.slides.entries()) {
    const svg = buildSlideSvg({ ...base, ...SLIDE_SIZE, slide, index, showCounter: input.slides.length > 1 })
    const webp = await toWebp(svgToPng(svg), SLIDE_SIZE, input.background)
    slides.push(await upload(input.storage, `${folder}/slide-${index + 1}.webp`, webp))
  }

  const coverSvg = buildSlideSvg({ ...base, ...FEED_COVER_SIZE, slide: input.slides[0], index: 0, showCounter: false })
  const coverWebp = await toWebp(svgToPng(coverSvg), FEED_COVER_SIZE, input.background)
  const coverUrl = await upload(input.storage, `${folder}/cover.webp`, coverWebp)

  return { slides, coverUrl }
}
