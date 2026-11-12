import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import type { SlideshowJobStatus, SlideshowJobView } from '@/lib/social/slideshow/slideshowTypes'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

/** Polled by the composer until the slideshow MP4 is in the Library. */
export async function GET(_req: NextRequest, context: RouteContext) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx
  const { id } = await context.params

  try {
    const { data: job, error } = await db
      .from('social_slideshow_jobs')
      .select('status, error_message, asset_id')
      .eq('id', id)
      .eq('business_id', businessId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let video: SlideshowJobView['video'] = null
    if (job.status === 'completed' && job.asset_id) {
      const { data: asset, error: assetErr } = await db
        .from('social_media_assets')
        .select('id, original_url, thumbnail_url, duration_seconds')
        .eq('id', job.asset_id)
        .eq('business_id', businessId)
        .maybeSingle()
      if (assetErr) throw new Error(assetErr.message)
      if (asset?.original_url) {
        video = {
          assetId: asset.id as string,
          url: asset.original_url as string,
          thumbnailUrl: (asset.thumbnail_url as string | null) ?? null,
          durationSeconds: asset.duration_seconds == null ? null : Number(asset.duration_seconds),
        }
      }
    }

    const view: SlideshowJobView = {
      status: job.status as SlideshowJobStatus,
      error: (job.error_message as string | null) ?? null,
      video,
    }
    return NextResponse.json(view)
  } catch (err) {
    console.error('[Slideshow] job status failed', { businessId, id, err })
    return NextResponse.json({ error: 'Could not check the slideshow video' }, { status: 500 })
  }
}
