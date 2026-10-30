/**
 * GET /api/social/videos/clips/[id]/script — the clip's spoken script (from its captions) for export.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { clipScriptText } from '@/lib/social/videoClips/clipScript'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  const { data: clip, error } = await ctx.db
    .from('social_media_assets')
    .select('id, clip_title, captions')
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .not('source_video_id', 'is', null)
    .maybeSingle()
  if (error) {
    console.error('[VideoClips] script load failed', error.message)
    return NextResponse.json({ error: 'Could not load the script' }, { status: 500 })
  }
  if (!clip) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ title: clip.clip_title ?? null, script: clipScriptText(clip.captions) })
}
