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
import { SOCIAL_VIDEO_ERRORS, SOCIAL_VIDEO_MAX_BYTES } from '@/lib/social/videoUploadLimits'
import { deleteR2Object } from '@/lib/social/videoClips/r2'
import { isLibraryR2Path, libraryR2PublicUrl } from '@/lib/social/libraryVideoR2'
import { finalizeLibraryR2Upload } from '@/lib/social/libraryR2Upload'

export const runtime = 'nodejs'

async function r2ObjectMeta(key: string, uploadIdRaw: unknown, declaredSize: number) {
  const uploadId =
    typeof uploadIdRaw === 'string' && uploadIdRaw.length <= 1024 ? uploadIdRaw : null
  const size = await finalizeLibraryR2Upload(key, uploadId, declaredSize)
  if (size != null && size > SOCIAL_VIDEO_MAX_BYTES) {
    await deleteR2Object(key)
    return { exists: false, size: null }
  }
  return { exists: size != null && size > 0, size }
}

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
    uploadId?: unknown
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

  const declaredSize = asset.file_size_bytes != null ? Number(asset.file_size_bytes) : 0
  let objectMeta: { exists: boolean; size: number | null }
  try {
    objectMeta = isLibraryR2Path(storagePath)
      ? await r2ObjectMeta(storagePath, body.uploadId, declaredSize)
      : await storageObjectMeta(ctx.db, storagePath)
  } catch (err) {
    console.error('[MediaAssets] finalize R2 failed', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.finalizeFailed }, { status: 500 })
  }
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

  const originalUrl = isLibraryR2Path(storagePath)
    ? libraryR2PublicUrl(storagePath)
    : publicSocialPostsUrl(storagePath)
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
