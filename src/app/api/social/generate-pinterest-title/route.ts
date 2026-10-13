import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { generatePinterestTitle } from '@/lib/social/pinterest/generatePinterestTitle'

const CAPTION_MAX = 5000
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Pin title for Create's Pinterest settings. Rides along with the caption, so no extra credits. */
export async function POST(req: NextRequest) {
  try {
    const ctx = await requirePaidBusinessAccess()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    const body = (await req.json().catch(() => null)) as { caption?: unknown; jobId?: unknown } | null
    const caption = typeof body?.caption === 'string' ? body.caption.trim().slice(0, CAPTION_MAX) : ''
    if (!caption) return NextResponse.json({ error: 'Write a caption first' }, { status: 400 })

    let itemTitle: string | null = null
    const jobId = typeof body?.jobId === 'string' ? body.jobId.trim() : ''
    if (UUID_RE.test(jobId)) {
      const { data, error } = await db
        .from('jobs')
        .select('title')
        .eq('id', jobId)
        .eq('business_id', businessId)
        .maybeSingle()
      if (error) console.warn('[Pinterest title] Job fetch failed (non-fatal):', error.message)
      itemTitle = typeof data?.title === 'string' ? data.title : null
    }

    const title = await generatePinterestTitle({ businessId, caption, itemTitle })
    return NextResponse.json({ title })
  } catch (err) {
    console.error('[Pinterest title]', err)
    return NextResponse.json({ error: 'Could not write a title' }, { status: 500 })
  }
}
