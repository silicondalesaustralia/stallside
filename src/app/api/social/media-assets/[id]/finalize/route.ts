/**
 * POST /api/social/media-assets/[id]/finalize
 * Marks an uploaded video ready after client metadata validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import {
  publicSocialPostsUrl,
  SOCIAL_VIDEO_BUCKET,
} from '@/lib/social/socialVideoStorage'
import { validateSocialVideoFinalizeRequest } from '@/lib/social/mediaAssetValidation'
import { storageObjectMeta } from '@/lib/social/mediaAssetStorage'
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

  let body: {
    durationSeconds?: number
    width?: number
    height?: number
    hasThumbnail?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validateSocialVideoFinalizeRequest(body)
  if (!validated.ok) {
    if (validated.markFailed) {
      await ctx.db
        .from('social_media_assets')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('business_id', ctx.businessId)
    }
    return NextResponse.json({ error: validated.error }, { status: validated.status })
  }

  const { data: asset, error: fetchErr } = await ctx.db
    .from('social_media_assets')
    .select(
      'id, business_id, status, storage_path, thumbnail_path, mime_type, file_size_bytes',
    )
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) {
    console.error('[MediaAssets] finalize fetch failed', fetchErr.message)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.finalizeFailed }, { status: 500 })
  }

  if (!asset || asset.business_id !== ctx.businessId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (asset.status !== 'uploading') {
    return NextResponse.json({ error: 'Asset is not awaiting finalize' }, { status: 409 })
  }

  const storagePath = asset.storage_path?.trim()
  if (!storagePath) {
    await ctx.db
      .from('social_media_assets')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.finalizeFailed }, { status: 400 })
  }

  const objectMeta = await storageObjectMeta(ctx.db, storagePath)
  if (!objectMeta.exists) {
    await ctx.db
      .from('social_media_assets')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.finalizeFailed }, { status: 400 })
  }

  const thumbPath = asset.thumbnail_path?.trim()
  let thumbnailUrl: string | null = null
  if (body.hasThumbnail && thumbPath) {
    const thumbMeta = await storageObjectMeta(ctx.db, thumbPath)
    if (thumbMeta.exists) {
      thumbnailUrl = publicSocialPostsUrl(thumbPath)
    }
  }

  const originalUrl = publicSocialPostsUrl(storagePath)
  const fileSize =
    objectMeta.size ??
    (asset.file_size_bytes != null ? Number(asset.file_size_bytes) : null)

  const { error: updateErr } = await ctx.db
    .from('social_media_assets')
    .update({
      status: 'ready',
      original_url: originalUrl,
      thumbnail_url: thumbnailUrl,
      duration_seconds: validated.durationSeconds,
      file_size_bytes: fileSize,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (updateErr) {
    console.error('[MediaAssets] finalize update failed', updateErr.message)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.finalizeFailed }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    asset: {
      id,
      status: 'ready',
      originalUrl,
      thumbnailUrl,
      durationSeconds: validated.durationSeconds,
      mimeType: asset.mime_type,
      bucket: SOCIAL_VIDEO_BUCKET,
    },
  })
}
