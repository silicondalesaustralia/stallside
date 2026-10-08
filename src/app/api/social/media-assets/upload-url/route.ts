/**
 * POST /api/social/media-assets/upload-url
 * Direct signed upload for social video (Library V1).
 */

import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import {
  buildSocialVideoOriginalPath,
  SOCIAL_VIDEO_BUCKET,
} from '@/lib/social/socialVideoStorage'
import { validateSocialVideoUploadRequest } from '@/lib/social/mediaAssetValidation'
import { resolveMediaAssetJobId } from '@/lib/social/mediaAssetJob'
import { SOCIAL_VIDEO_ERRORS } from '@/lib/social/videoUploadLimits'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  let body: { mimeType?: string; size?: number; aboutText?: string; jobId?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validateSocialVideoUploadRequest(body)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: validated.status })
  }

  const assetId = randomUUID()
  const path = buildSocialVideoOriginalPath(
    ctx.businessId,
    assetId,
    validated.mimeType,
  )
  const aboutText =
    typeof body.aboutText === 'string' ? body.aboutText.trim().slice(0, 2000) : null

  const jobResolved = await resolveMediaAssetJobId(ctx.db, ctx.businessId, body.jobId)
  if (!jobResolved.ok) {
    return NextResponse.json({ error: jobResolved.error }, { status: jobResolved.status })
  }

  const { error: insertErr } = await ctx.db.from('social_media_assets').insert({
    id: assetId,
    business_id: ctx.businessId,
    job_id: jobResolved.jobId,
    media_type: 'video',
    status: 'uploading',
    storage_path: path,
    mime_type: validated.mimeType,
    file_size_bytes: validated.size,
    about_text: aboutText || null,
  })

  if (insertErr) {
    const missing =
      insertErr.code === '42P01' ||
      /does not exist|schema cache/i.test(insertErr.message ?? '')
    if (missing) {
      console.error('[MediaAssets] table missing - run migration 130')
      return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.uploadFailed }, { status: 503 })
    }
    console.error('[MediaAssets] insert failed', insertErr.message)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.uploadFailed }, { status: 500 })
  }

  const { data, error } = await ctx.db.storage
    .from(SOCIAL_VIDEO_BUCKET)
    .createSignedUploadUrl(path)

  if (error || !data?.signedUrl || !data.token) {
    await ctx.db.from('social_media_assets').update({ status: 'failed' }).eq('id', assetId)
    console.error('[MediaAssets] signed upload url failed', error)
    return NextResponse.json({ error: SOCIAL_VIDEO_ERRORS.uploadFailed }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    assetId,
    bucket: SOCIAL_VIDEO_BUCKET,
    path: data.path || path,
    token: data.token,
    signedUrl: data.signedUrl,
  })
}
