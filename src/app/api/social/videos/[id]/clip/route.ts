/**
 * POST /api/social/videos/[id]/clip
 * Queues an AI clip job for a ready source video (worker picks it up).
 */

import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { VIDEO_SOURCE_ERRORS, isVideoSourceExpired } from '@/lib/social/videoClips/limits'
import { clipJobDurationError, parseClipJobOptions } from '@/lib/social/videoClips/validation'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, context: RouteContext<'/api/social/videos/[id]/clip'>) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data: source, error: fetchErr } = await ctx.db
    .from('social_video_sources')
    .select('id, status, created_at, duration_seconds')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .maybeSingle()
  if (fetchErr) {
    console.error('[VideoClips] clip source fetch failed', fetchErr.message)
    return NextResponse.json({ error: 'Could not start clipping' }, { status: 500 })
  }
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (source.status !== 'ready') {
    return NextResponse.json({ error: 'This video is not ready yet' }, { status: 409 })
  }
  if (isVideoSourceExpired(source.created_at)) {
    return NextResponse.json({ error: VIDEO_SOURCE_ERRORS.expired }, { status: 410 })
  }

  const options = parseClipJobOptions(body)
  const sourceDuration = Number(source.duration_seconds)
  const durationError = clipJobDurationError(
    options.clipLength,
    Number.isFinite(sourceDuration) ? sourceDuration : null,
  )
  if (durationError) return NextResponse.json({ error: durationError }, { status: 400 })

  const jobId = randomUUID()
  const { data: job, error: insertErr } = await ctx.db
    .from('social_video_clip_jobs')
    .insert({
      id: jobId,
      source_id: id,
      business_id: ctx.businessId,
      status: 'pending',
      clip_count: options.clipCount,
      clip_length: options.clipLength,
      aspect: options.aspect,
      caption_style: options.captionStyle,
      caption_position: options.captionPosition,
    })
    .select('id')
    .single()

  if (insertErr) {
    const full = options.clipLength === 'full'
    if (insertErr.code === '23505') {
      return NextResponse.json(
        { error: full ? 'This video is already being prepared' : 'This video is already being clipped' },
        { status: 409 },
      )
    }
    if (insertErr.code === '23514' && full) {
      console.error(
        '[VideoClips] whole-video jobs need supabase/social/011_video_clips.sql',
        insertErr.message,
      )
    }
    console.error('[VideoClips] clip job insert failed', insertErr.message)
    return NextResponse.json(
      { error: full ? 'Could not prepare this video' : 'Could not start clipping' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, jobId: job.id })
}
