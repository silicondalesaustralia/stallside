/**
 * GET  /api/social/videos/clips/[id]/captions — caption cues + style for the editor.
 * POST /api/social/videos/clips/[id]/captions — save edits and queue a re-render.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { parseCaptionsDoc, sanitizeCues } from '@/lib/social/videoClips/captionCues'
import { parseCaptionSettings } from '@/lib/social/videoClips/captionStyles'
import { publicSocialPostsUrl } from '@/lib/social/socialVideoStorage'
import { fullSegments, isFullClip, normalizeSegments } from '@/lib/social/videoClips/timeline'
import { sanitizeOverlays } from '@/lib/social/videoClips/textOverlays'
import { parseClipSpeed } from '@/lib/social/videoClips/playbackSpeed'
import { sanitizeAudioMutes } from '@/lib/social/videoClips/audioEdits'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }
type Ctx = Extract<Awaited<ReturnType<typeof requirePaidBusinessAccess>>, { ok: true }>

async function loadClip(ctx: Ctx, id: string) {
  return ctx.db
    .from('social_media_assets')
    .select('id, storage_path, duration_seconds, captions, source_video_id')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .not('source_video_id', 'is', null)
    .maybeSingle()
}

/** Unedited legacy clips: the asset duration is the caption-free clip length. */
function cleanDurationOf(docDuration: number | null, assetDuration: unknown): number {
  const fallback = Number(assetDuration)
  return docDuration ?? (Number.isFinite(fallback) && fallback > 0 ? fallback : 600)
}

async function hasActiveJob(ctx: Ctx, assetId: string): Promise<boolean> {
  const { count } = await ctx.db
    .from('social_video_caption_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('asset_id', assetId)
    .in('status', ['pending', 'processing'])
  return (count ?? 0) > 0
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  const { data: clip, error } = await loadClip(ctx, id)
  if (error) {
    console.error('[VideoCaptions] load failed', error.message)
    return NextResponse.json({ error: 'Could not load captions' }, { status: 500 })
  }
  if (!clip) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const doc = parseCaptionsDoc(clip.captions)
  const duration = cleanDurationOf(doc.cleanDuration, clip.duration_seconds)
  return NextResponse.json({
    cues: doc.cues,
    settings: doc.settings,
    durationSeconds: duration,
    segments: doc.segments ?? fullSegments(duration),
    overlays: doc.overlays,
    speed: parseClipSpeed(doc.speed),
    audioMutes: doc.audioMutes ?? [],
    previewUrl: publicSocialPostsUrl(doc.cleanPath ?? clip.storage_path) || null,
    rendering: await hasActiveJob(ctx, clip.id),
  })
}

export async function POST(req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  let body: {
    cues?: unknown
    settings?: unknown
    segments?: unknown
    overlays?: unknown
    speed?: unknown
    audioMutes?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data: clip, error } = await loadClip(ctx, id)
  if (error) {
    console.error('[VideoCaptions] load failed', error.message)
    return NextResponse.json({ error: 'Could not save captions' }, { status: 500 })
  }
  if (!clip) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (await hasActiveJob(ctx, clip.id)) {
    return NextResponse.json({ error: 'Captions are already updating — try again shortly' }, { status: 409 })
  }

  const doc = parseCaptionsDoc(clip.captions)
  const duration = cleanDurationOf(doc.cleanDuration, clip.duration_seconds)
  const segments = normalizeSegments(body.segments, duration)
  const next = {
    ...doc,
    cues: sanitizeCues(body.cues, duration),
    settings: parseCaptionSettings(body.settings),
    cleanPath: doc.cleanPath ?? clip.storage_path,
    cleanDuration: duration,
    segments: isFullClip(segments, duration) ? null : segments,
    overlays: sanitizeOverlays(body.overlays, duration),
    speed: parseClipSpeed(body.speed),
    audioMutes: sanitizeAudioMutes(body.audioMutes, duration),
  }

  const { error: updateErr } = await ctx.db
    .from('social_media_assets')
    .update({ captions: next })
    .eq('id', clip.id)
    .eq('business_id', ctx.businessId)
  if (updateErr) {
    console.error('[VideoCaptions] save failed', updateErr.message)
    return NextResponse.json({ error: 'Could not save captions' }, { status: 500 })
  }

  const { error: jobErr } = await ctx.db
    .from('social_video_caption_jobs')
    .insert({ asset_id: clip.id, business_id: ctx.businessId, status: 'pending' })
  if (jobErr) {
    if (jobErr.code === '23505') {
      return NextResponse.json({ error: 'Captions are already updating' }, { status: 409 })
    }
    console.error('[VideoCaptions] job insert failed', jobErr.message)
    return NextResponse.json({ error: 'Could not update captions' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
