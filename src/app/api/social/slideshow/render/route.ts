import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { parseSlideshowRenderRequest, type SlideshowRenderResult } from '@/lib/social/slideshow/slideshowTypes'
import { assertSlideshowImagesAllowed } from '@/lib/social/slideshow/slideshowImages'
import { renderSlideshowImages } from '@/lib/social/slideshow/renderSlideshow'
import { loadSlideshowBusiness, ownedJobId } from '@/lib/social/slideshow/slideshowContext'
import { saveSlidesToLibrary } from '@/lib/social/slideshow/slideshowLibrary'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Renders the edited slides to images and queues the MP4 on the video worker. */
export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const parsed = parseSlideshowRenderRequest(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.message }, { status: 400 })
  const request = parsed.value

  try {
    const business = await loadSlideshowBusiness(db, businessId)
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    await assertSlideshowImagesAllowed(db, businessId, request.slides.map((s) => s.imageUrl))
    const rendered = await renderSlideshowImages({
      storage: db,
      businessId,
      businessName: business.name,
      brandColor: request.accentColor ?? business.brandColor,
      slides: request.slides,
      showText: request.showText,
    })

    const itemId = await ownedJobId(db, businessId, request.jobId)
    await saveSlidesToLibrary(db, { businessId, jobId: itemId, slides: request.slides, slideUrls: rendered.slideUrls })

    const { data: job, error } = await db
      .from('social_slideshow_jobs')
      .insert({
        business_id: businessId,
        job_id: itemId,
        slide_paths: rendered.slidePaths,
        seconds_per_slide: request.secondsPerSlide,
        transition: request.transition,
        about_text: request.about || request.slides.map((s) => s.heading).join('. ').slice(0, 2000),
      })
      .select('id')
      .single()
    if (error || !job) throw new Error(`Could not queue the video: ${error?.message ?? 'no row returned'}`)

    const result: SlideshowRenderResult = {
      renderJobId: job.id as string,
      slideUrls: rendered.slideUrls,
      coverUrl: rendered.coverUrl,
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Slideshow] render failed', { businessId, err })
    const message = err instanceof Error ? err.message : 'Could not create the slides'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
