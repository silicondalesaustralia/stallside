/**
 * POST /api/social/videos/[id]/finalize
 * Marks an uploaded source video ready after duration validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { VIDEO_SOURCE_ERRORS, VIDEO_SOURCE_MAX_BYTES } from '@/lib/social/videoClips/limits'
import { headR2Object } from '@/lib/social/videoClips/r2'
import { completeMultipartUpload, multipartPartCount } from '@/lib/social/videoClips/r2Multipart'
import { validateVideoSourceDuration } from '@/lib/social/videoClips/validation'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  let body: { durationSeconds?: unknown; uploadId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data: source, error: fetchErr } = await ctx.db
    .from('social_video_sources')
    .select('id, status, storage_path, file_size_bytes')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .maybeSingle()
  if (fetchErr) {
    console.error('[VideoClips] finalize fetch failed', fetchErr.message)
    return NextResponse.json({ error: VIDEO_SOURCE_ERRORS.finalizeFailed }, { status: 500 })
  }
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (source.status !== 'uploading') {
    return NextResponse.json({ error: 'Video is not awaiting finalize' }, { status: 409 })
  }

  const markFailed = () =>
    ctx.db
      .from('social_video_sources')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', id)

  const uploadId = typeof body.uploadId === 'string' && body.uploadId.length <= 1024 ? body.uploadId : null
  const duration = validateVideoSourceDuration(body.durationSeconds)
  if (!duration.ok) {
    await markFailed()
    return NextResponse.json({ error: duration.error }, { status: 400 })
  }

  let uploadedBytes: number | null
  try {
    if (uploadId) {
      const expectedParts = multipartPartCount(Number(source.file_size_bytes) || 0)
      await completeMultipartUpload(source.storage_path, uploadId, expectedParts)
    }
    uploadedBytes = await headR2Object(source.storage_path)
  } catch (err) {
    console.error('[VideoClips] finalize R2 failed', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: VIDEO_SOURCE_ERRORS.finalizeFailed }, { status: 500 })
  }
  if (!uploadedBytes || uploadedBytes > VIDEO_SOURCE_MAX_BYTES) {
    await markFailed()
    const error = uploadedBytes ? VIDEO_SOURCE_ERRORS.tooLarge : VIDEO_SOURCE_ERRORS.finalizeFailed
    return NextResponse.json({ error }, { status: 400 })
  }

  const { error: updateErr } = await ctx.db
    .from('social_video_sources')
    .update({
      status: 'ready',
      duration_seconds: duration.durationSeconds,
      file_size_bytes: uploadedBytes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('business_id', ctx.businessId)
  if (updateErr) {
    console.error('[VideoClips] finalize update failed', updateErr.message)
    return NextResponse.json({ error: VIDEO_SOURCE_ERRORS.finalizeFailed }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
