/**
 * POST /api/social/media-assets/[id]/process - queue branded video job
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import {
  createVideoProcessingJob,
  parseBrandingRequestBody,
} from '@/lib/social/videoBranding/createProcessingJob'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing asset id' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data: business } = await ctx.db
    .from('businesses')
    .select('social_logo_corner, logo_url, brand_color, social_text_styles')
    .eq('id', ctx.businessId)
    .maybeSingle()

  const parsed = parseBrandingRequestBody(body, business?.social_logo_corner, {
    brandColor: business?.brand_color,
    socialTextStyles: business?.social_text_styles as import('@/lib/social/socialTextStyle').SocialTextStyles | null,
  })
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }

  const result = await createVideoProcessingJob(ctx.db, {
    businessId: ctx.businessId,
    assetId: id,
    config: parsed.config,
    defaultLogoCorner: business?.social_logo_corner,
    fallbackLogoUrl: business?.logo_url,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({
    ok: true,
    jobId: result.jobId,
    processingStatus: 'processing',
  })
}
