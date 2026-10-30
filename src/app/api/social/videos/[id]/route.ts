/**
 * PATCH  /api/social/videos/[id] — rename a source video.
 * DELETE /api/social/videos/[id] — remove a source video. Clips already saved to Library are kept.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { deleteR2Object } from '@/lib/social/videoClips/r2'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

const MAX_TITLE_CHARS = 120

export async function PATCH(req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  let body: { title?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, MAX_TITLE_CHARS) : ''
  if (!title) return NextResponse.json({ error: 'Enter a name for the video' }, { status: 400 })

  const { data, error } = await ctx.db
    .from('social_video_sources')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .select('id')
    .maybeSingle()
  if (error) {
    console.error('[VideoClips] rename failed', error.message)
    return NextResponse.json({ error: 'Could not rename video' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true, title })
}

export async function DELETE(_req: Request, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  const { data: source, error: fetchErr } = await ctx.db
    .from('social_video_sources')
    .select('id, storage_path')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .maybeSingle()
  if (fetchErr) {
    console.error('[VideoClips] delete fetch failed', fetchErr.message)
    return NextResponse.json({ error: 'Could not delete video' }, { status: 500 })
  }
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { count: activeJobs } = await ctx.db
    .from('social_video_clip_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('source_id', id)
    .in('status', ['pending', 'processing'])
  if ((activeJobs ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Wait for clipping to finish before deleting this video' },
      { status: 409 },
    )
  }

  try {
    await deleteR2Object(source.storage_path)
  } catch (err) {
    console.warn('[VideoClips] source R2 delete failed', err instanceof Error ? err.message : err)
  }

  const { error: deleteErr } = await ctx.db
    .from('social_video_sources')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)
  if (deleteErr) {
    console.error('[VideoClips] source delete failed', deleteErr.message)
    return NextResponse.json({ error: 'Could not delete video' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
