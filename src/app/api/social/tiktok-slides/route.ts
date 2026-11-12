import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { assertSlideshowImagesAllowed, fetchSlideshowImage } from '@/lib/social/slideshow/slideshowImages'
import { parseSlideRequest, type SlideDeckResult } from '@/lib/social/tiktokSlides/slideTypes'
import { writeTikTokSlides } from '@/lib/social/tiktokSlides/writeSlides'
import { renderAndStoreSlides } from '@/lib/social/tiktokSlides/renderSlides'

export const runtime = 'nodejs'
export const maxDuration = 60

async function fetchBackground(db: SupabaseClient, businessId: string, url: string | null): Promise<Buffer | null> {
  if (!url) return null
  await assertSlideshowImagesAllowed(db, businessId, [url])
  return fetchSlideshowImage(url)
}

/** AI-written TikTok photo slides, rendered server-side (no render credits). */
export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const parsed = parseSlideRequest(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.message }, { status: 400 })
  const request = parsed.value

  try {
    const { data: business, error: bizErr } = await db
      .from('businesses')
      .select('name, brand_color')
      .eq('id', businessId)
      .single()
    if (bizErr || !business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    let job: { title: string | null; description: string | null; suburb: string | null } | null = null
    if (request.jobId) {
      const { data } = await db
        .from('jobs')
        .select('title, description, site_suburb')
        .eq('id', request.jobId)
        .eq('business_id', businessId)
        .maybeSingle()
      if (data) job = { title: data.title, description: data.description, suburb: data.site_suburb }
    }

    const businessName = (business.name as string | null)?.trim() || 'Our team'
    const background = await fetchBackground(db, businessId, request.backgroundUrl)
    const written = await writeTikTokSlides({
      businessId,
      businessName,
      topic: request.topic,
      slideCount: request.slideCount,
      job,
    })
    const rendered = await renderAndStoreSlides({
      storage: db,
      businessId,
      businessName,
      brandColor: business.brand_color as string | null,
      slides: written.slides,
      background,
    })
    const result: SlideDeckResult = { ...rendered, caption: written.caption }
    return NextResponse.json(result)
  } catch (err) {
    console.error('[TikTokSlides] Generate failed', { businessId, err })
    const message = err instanceof Error ? err.message : 'Could not make slides'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
