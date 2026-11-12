import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { parseSlideshowWriteRequest } from '@/lib/social/slideshow/slideshowTypes'
import {
  assertSlideshowImagesAllowed,
  fetchSlideshowImage,
  toVisionJpeg,
} from '@/lib/social/slideshow/slideshowImages'
import { writeSlideshow } from '@/lib/social/slideshow/writeSlideshow'
import { loadSlideshowBusiness, loadSlideshowItem } from '@/lib/social/slideshow/slideshowContext'

export const runtime = 'nodejs'
export const maxDuration = 60

/** AI looks at the picked images (plus the seller's notes) and writes one slide per image. Nothing is rendered. */
export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const parsed = parseSlideshowWriteRequest(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.message }, { status: 400 })
  const request = parsed.value

  try {
    const business = await loadSlideshowBusiness(db, businessId)
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    await assertSlideshowImagesAllowed(db, businessId, request.images)
    const visionImages = await Promise.all(
      request.images.map(async (url) => toVisionJpeg(await fetchSlideshowImage(url))),
    )
    const result = await writeSlideshow({
      businessId,
      businessName: business.name,
      context: request.context,
      imageUrls: request.images,
      visionImages,
      item: await loadSlideshowItem(db, businessId, request.jobId),
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Slideshow] write failed', { businessId, err })
    const message = err instanceof Error ? err.message : 'Could not write the slides'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
