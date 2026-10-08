/**
 * GET /api/social/media-assets/[id]/processing-status
 */

import { NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { processedPublicUrl } from '@/lib/social/videoBranding/createProcessingJob'
import type { VideoBrandingConfig, VideoProcessingStatus } from '@/lib/social/videoBranding/types'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

const USER_FACING_FAILURE =
  "We couldn't create the branded video. Try again."

export async function GET(_req: Request, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing asset id' }, { status: 400 })
  }

  const { data: asset, error: assetErr } = await ctx.db
    .from('social_media_assets')
    .select(
      'id, business_id, status, original_url, processed_url, processed_storage_path, processing_status, branding_config',
    )
    .eq('id', id)
    .maybeSingle()

  if (assetErr) {
    console.error('[VideoBranding] status fetch failed', assetErr.message)
    return NextResponse.json({ error: 'Could not load status' }, { status: 500 })
  }

  if (!asset || asset.business_id !== ctx.businessId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const processingStatus = (asset.processing_status ?? 'none') as VideoProcessingStatus

  const { data: latestJob } = await ctx.db
    .from('social_video_processing_jobs')
    .select('id, status, created_at, completed_at')
    .eq('asset_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let processedUrl = typeof asset.processed_url === 'string' ? asset.processed_url.trim() : ''
  if (!processedUrl && asset.processed_storage_path) {
    processedUrl = processedPublicUrl(asset.processed_storage_path, ctx.db)
  }

  const brandingConfig = (asset.branding_config ?? null) as VideoBrandingConfig | null

  return NextResponse.json({
    assetId: id,
    assetStatus: asset.status,
    processingStatus,
    processedUrl,
    originalUrl: asset.original_url,
    brandingConfig,
    job: latestJob
      ? {
          id: latestJob.id,
          status: latestJob.status,
          createdAt: latestJob.created_at,
          completedAt: latestJob.completed_at,
        }
      : null,
    userMessage:
      processingStatus === 'processing_failed' ? USER_FACING_FAILURE : null,
  })
}
