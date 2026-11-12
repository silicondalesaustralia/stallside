import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { summarizeComposerDraft } from '@/lib/tradiespost/composer/composerDraft'
import { parseDraftRequestBody } from '@/lib/tradiespost/composer/composerDraftRequest'

/** Saved Create drafts, newest first (summaries only). */
export async function GET() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { data, error } = await db
    .from('social_post_drafts')
    .select('id, data, updated_at')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) {
    console.error('[Drafts] list failed', { businessId, error: error.message })
    return NextResponse.json({ error: 'Could not load drafts' }, { status: 500 })
  }
  const drafts = (data ?? []).map((row) => summarizeComposerDraft(row.id as string, row.updated_at as string, row.data))
  return NextResponse.json({ drafts })
}

export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const parsed = parseDraftRequestBody(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.message }, { status: 400 })

  const { data, error } = await db
    .from('social_post_drafts')
    .insert({ business_id: businessId, data: parsed.draft })
    .select('id, updated_at')
    .single()
  if (error || !data) {
    console.error('[Drafts] create failed', { businessId, error: error?.message })
    return NextResponse.json({ error: 'Could not save the draft' }, { status: 500 })
  }
  return NextResponse.json({ id: data.id, updatedAt: data.updated_at }, { status: 201 })
}
