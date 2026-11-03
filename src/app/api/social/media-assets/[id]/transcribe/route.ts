/**
 * POST /api/social/media-assets/[id]/transcribe
 * Queues auto captions for a Library video (1 credit, refunded if it fails).
 */

import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { hasActiveCaptionJob, loadLibraryEditAsset } from '@/lib/social/libraryEditDoc'
import {
  LIBRARY_CAPTIONS_CREDIT_COST,
  libraryCaptionsCreditActionId,
} from '@/lib/social/libraryCaptionsCredit'
import { HostCreditsExhaustedError, hostConsumeCredits, hostRefundCredits } from '@/lib/socialHost/hostCredits'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

const FAILED = 'Could not start captions'

export async function POST(_req: Request, context: RouteContext) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { id } = await context.params

  try {
    const { data: asset, error } = await loadLibraryEditAsset(ctx.db, ctx.businessId, id)
    if (error) throw new Error(error.message)
    if (!asset?.storage_path) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (await hasActiveCaptionJob(ctx.db, asset.id)) {
      return NextResponse.json({ error: 'Captions are already being made' }, { status: 409 })
    }
  } catch (err) {
    console.error('[LibraryEdit] transcribe lookup failed', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: FAILED }, { status: 500 })
  }

  const jobId = randomUUID()
  const credit = { socialBusinessId: ctx.businessId, kind: 'clip' as const, actionId: libraryCaptionsCreditActionId(jobId) }
  try {
    await hostConsumeCredits({ ...credit, count: LIBRARY_CAPTIONS_CREDIT_COST, feature: 'library_captions' })
  } catch (err) {
    if (err instanceof HostCreditsExhaustedError) {
      return NextResponse.json({ error: err.message, code: 'credits_exhausted' }, { status: 402 })
    }
    console.error('[LibraryEdit] captions credit charge failed', err)
    return NextResponse.json({ error: FAILED }, { status: 500 })
  }

  const { error: jobErr } = await ctx.db
    .from('social_video_caption_jobs')
    .insert({ id: jobId, asset_id: id, business_id: ctx.businessId, status: 'pending' })
  if (jobErr) {
    await hostRefundCredits(credit).catch((err: unknown) =>
      console.error('[LibraryEdit] captions credit refund failed', jobId, err),
    )
    const busy = jobErr.code === '23505'
    if (!busy) console.error('[LibraryEdit] caption job insert failed', jobErr.message)
    return NextResponse.json(
      { error: busy ? 'Captions are already being made' : FAILED },
      { status: busy ? 409 : 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
