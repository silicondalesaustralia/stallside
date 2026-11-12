import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { parseComposerDraft } from '@/lib/tradiespost/composer/composerDraft'
import { parseDraftRequestBody } from '@/lib/tradiespost/composer/composerDraftRequest'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { data, error } = await db
    .from('social_post_drafts')
    .select('id, data, updated_at')
    .eq('id', id)
    .eq('business_id', businessId)
    .maybeSingle()
  if (error) {
    console.error('[Drafts] load failed', { id, error: error.message })
    return NextResponse.json({ error: 'Could not load the draft' }, { status: 500 })
  }
  const draft = data ? parseComposerDraft(data.data) : null
  if (!data || !draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  return NextResponse.json({ id: data.id, updatedAt: data.updated_at, draft })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const parsed = parseDraftRequestBody(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.message }, { status: 400 })

  const { data, error } = await db
    .from('social_post_drafts')
    .update({ data: parsed.draft, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('business_id', businessId)
    .select('id, updated_at')
    .maybeSingle()
  if (error) {
    console.error('[Drafts] update failed', { id, error: error.message })
    return NextResponse.json({ error: 'Could not save the draft' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  return NextResponse.json({ id: data.id, updatedAt: data.updated_at })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { error } = await db.from('social_post_drafts').delete().eq('id', id).eq('business_id', businessId)
  if (error) {
    console.error('[Drafts] delete failed', { id, error: error.message })
    return NextResponse.json({ error: 'Could not delete the draft' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
