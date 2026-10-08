/**
 * POST /api/social/media-assets/[id]/thumbnail-upload-url
 * Signed upload for client-generated WebP thumbnail (small file).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import {
  buildSocialVideoThumbnailPath,
  SOCIAL_VIDEO_BUCKET,
} from '@/lib/social/socialVideoStorage'
import { validateThumbnailUploadRequest } from '@/lib/social/mediaAssetValidation'
import { SOCIAL_VIDEO_ERRORS } from '@/lib/social/videoUploadLimits'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing asset id' }, { status: 400 })
  }

  let body: { size?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validateThumbnailUploadRequest(body.size)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { data: asset, error: fetchErr } = await ctx.db
    .from('social_media_assets')
    .select('id, business_id, status')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) {
    console.error('[MediaAssets] thumbnail url fetch failed', fetchErr.message)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.uploadFailed }, { status: 500 })
  }

  if (!asset || asset.business_id !== ctx.businessId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (asset.status !== 'uploading') {
    return NextResponse.json({ error: 'Asset is not awaiting upload' }, { status: 409 })
  }

  const path = buildSocialVideoThumbnailPath(ctx.businessId, id)

  await ctx.db
    .from('social_media_assets')
    .update({ thumbnail_path: path, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  const { data, error } = await ctx.db.storage
    .from(SOCIAL_VIDEO_BUCKET)
    .createSignedUploadUrl(path)

  if (error || !data?.signedUrl || !data.token) {
    console.error('[MediaAssets] thumbnail signed url failed', error)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.uploadFailed }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    bucket: SOCIAL_VIDEO_BUCKET,
    path: data.path || path,
    token: data.token,
    signedUrl: data.signedUrl,
  })
}
