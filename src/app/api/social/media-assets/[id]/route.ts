/**
 * PATCH /api/social/media-assets/[id] - update caption
 * DELETE /api/social/media-assets/[id] - remove asset + storage
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { removeStoragePaths } from '@/lib/social/mediaAssetStorage'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing asset id' }, { status: 400 })
  }

  let body: { caption?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.caption !== 'string') {
    return NextResponse.json({ error: 'Caption is required' }, { status: 400 })
  }

  const caption = body.caption.trim().slice(0, 5000)

  const { data: asset, error: fetchErr } = await ctx.db
    .from('social_media_assets')
    .select('id, business_id, status')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) {
    console.error('[MediaAssets] patch fetch failed', fetchErr.message)
    return NextResponse.json({ error: 'Could not save caption' }, { status: 500 })
  }

  if (!asset || asset.business_id !== ctx.businessId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (asset.status !== 'ready') {
    return NextResponse.json({ error: 'Asset is not ready' }, { status: 409 })
  }

  const { error: updateErr } = await ctx.db
    .from('social_media_assets')
    .update({
      caption: caption || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (updateErr) {
    console.error('[MediaAssets] patch update failed', updateErr.message)
    return NextResponse.json({ error: 'Could not save caption' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, caption: caption || null })
}

export async function DELETE(_req: Request, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing asset id' }, { status: 400 })
  }

  const { data: asset, error: fetchErr } = await ctx.db
    .from('social_media_assets')
    .select('id, business_id, storage_path, thumbnail_path, processed_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) {
    console.error('[MediaAssets] delete fetch failed', fetchErr.message)
    return NextResponse.json({ error: 'Could not delete video' }, { status: 500 })
  }

  if (!asset || asset.business_id !== ctx.businessId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await ctx.db
    .from('social_video_processing_jobs')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('asset_id', id)
    .in('status', ['pending', 'processing'])

  await removeStoragePaths(ctx.db, [
    asset.storage_path,
    asset.thumbnail_path,
    asset.processed_storage_path,
  ])

  const { error: deleteErr } = await ctx.db
    .from('social_media_assets')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (deleteErr) {
    console.error('[MediaAssets] delete row failed', deleteErr.message)
    return NextResponse.json({ error: 'Could not delete video' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
