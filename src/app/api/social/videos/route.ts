/**
 * GET /api/social/videos
 * Source videos (Videos section) with latest clip job + generated clips.
 */

import { NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { listVideoSources } from '@/lib/social/videoClips/listVideoSources'

export const runtime = 'nodejs'

export async function GET() {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  try {
    const sources = await listVideoSources(ctx.db, ctx.businessId)
    return NextResponse.json({ sources })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (/does not exist|schema cache/i.test(message)) {
      console.error('[VideoClips] tables missing - run migration 280')
      return NextResponse.json({ sources: [] })
    }
    console.error('[VideoClips] list failed', message)
    return NextResponse.json({ error: 'Could not load videos' }, { status: 500 })
  }
}
