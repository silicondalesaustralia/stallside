import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { withLibraryCaption } from '@/lib/social/libraryRenderUtils'

const CAPTION_MAX = 2200

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  let body: { caption?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const caption = typeof body.caption === 'string' ? body.caption.trim() : ''
  if (!caption) {
    return NextResponse.json({ error: 'Caption required' }, { status: 400 })
  }

  const { data: row, error: loadErr } = await db
    .from('hybrid_social_renders')
    .select('id, content')
    .eq('id', id)
    .eq('business_id', businessId)
    .maybeSingle()

  if (loadErr) {
    console.error('[HybridRenders] caption load failed', loadErr.message)
    return NextResponse.json({ error: 'Could not update caption' }, { status: 500 })
  }
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const existing =
    row.content && typeof row.content === 'object' && !Array.isArray(row.content)
      ? (row.content as Record<string, unknown>)
      : {}
  const content = withLibraryCaption(existing, caption.slice(0, CAPTION_MAX))

  const { error: updateErr } = await db
    .from('hybrid_social_renders')
    .update({ content })
    .eq('id', id)
    .eq('business_id', businessId)

  if (updateErr) {
    console.error('[HybridRenders] caption save failed', updateErr.message)
    return NextResponse.json({ error: 'Could not save caption' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, caption: content.caption })
}
