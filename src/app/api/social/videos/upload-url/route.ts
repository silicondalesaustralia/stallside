/**
 * POST /api/social/videos/upload-url
 * Creates a source video row + presigned R2 upload URL.
 */

import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { resolveMediaAssetJobId } from '@/lib/social/mediaAssetJob'
import { VIDEO_SOURCE_ERRORS, buildVideoSourcePath } from '@/lib/social/videoClips/limits'
import { presignR2Url } from '@/lib/social/videoClips/r2'
import {
  MULTIPART_MIN_FILE_BYTES,
  MULTIPART_PART_BYTES,
  createMultipartUpload,
  multipartPartCount,
  presignPartUrls,
} from '@/lib/social/videoClips/r2Multipart'
import { cleanOptionalText, validateVideoSourceUpload } from '@/lib/social/videoClips/validation'

export const runtime = 'nodejs'

const UPLOAD_URL_TTL_SECONDS = 3 * 60 * 60

export async function POST(req: NextRequest) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validateVideoSourceUpload(body)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const jobResolved = await resolveMediaAssetJobId(
    ctx.db,
    ctx.businessId,
    typeof body.jobId === 'string' ? body.jobId : null,
  )
  if (!jobResolved.ok) {
    return NextResponse.json({ error: jobResolved.error }, { status: jobResolved.status })
  }

  const sourceId = randomUUID()
  const path = buildVideoSourcePath(ctx.businessId, sourceId, validated.mimeType)

  const { error: insertErr } = await ctx.db.from('social_video_sources').insert({
    id: sourceId,
    business_id: ctx.businessId,
    job_id: jobResolved.jobId,
    status: 'uploading',
    title: cleanOptionalText(body.title, 120),
    about_text: cleanOptionalText(body.aboutText, 2000),
    storage_path: path,
    mime_type: validated.mimeType,
    file_size_bytes: validated.size,
  })
  if (insertErr) {
    console.error('[VideoClips] source insert failed', insertErr.message)
    return NextResponse.json({ error: VIDEO_SOURCE_ERRORS.uploadFailed }, { status: 500 })
  }

  try {
    // Opt-in so a browser still running an older bundle keeps getting a single signed URL.
    if (body.multipart === true && validated.size >= MULTIPART_MIN_FILE_BYTES) {
      const uploadId = await createMultipartUpload(path, validated.mimeType)
      const partUrls = presignPartUrls(path, uploadId, multipartPartCount(validated.size), UPLOAD_URL_TTL_SECONDS)
      return NextResponse.json({
        ok: true,
        sourceId,
        multipart: { uploadId, partSize: MULTIPART_PART_BYTES, partUrls },
      })
    }
    return NextResponse.json({ ok: true, sourceId, signedUrl: presignR2Url('PUT', path, UPLOAD_URL_TTL_SECONDS) })
  } catch (err) {
    await ctx.db.from('social_video_sources').update({ status: 'failed' }).eq('id', sourceId)
    console.error('[VideoClips] R2 presign failed', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: VIDEO_SOURCE_ERRORS.uploadFailed }, { status: 500 })
  }
}
