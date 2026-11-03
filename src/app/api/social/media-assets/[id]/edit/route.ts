/**
 * GET /api/social/media-assets/[id]/edit
 * Saved timeline edits (cuts, voice, speed, captions, text) for the Library video editor.
 * Edits are saved with the branding settings via POST /process.
 */

import { NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import {
  hasActiveCaptionJob,
  libraryEditResponse,
  loadLibraryEditAsset,
} from '@/lib/social/libraryEditDoc'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  try {
    const { data: asset, error } = await loadLibraryEditAsset(ctx.db, ctx.businessId, id)
    if (error) throw new Error(error.message)
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const transcribing = await hasActiveCaptionJob(ctx.db, asset.id)
    return NextResponse.json(libraryEditResponse(asset, { transcribing }))
  } catch (err) {
    console.error('[LibraryEdit] load failed', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not load this video for editing' }, { status: 500 })
  }
}
