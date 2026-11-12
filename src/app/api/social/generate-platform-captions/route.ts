import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { consumeAiCredits, refundAiCredits } from '@/lib/billing/consumeAiCredits'
import { parsePlatformCaptionsRequest } from '@/lib/social/platformCaptions/platformCaptionTypes'
import { loadPlatformCaptionContext } from '@/lib/social/platformCaptions/platformCaptionContext'
import { writePlatformCaptions } from '@/lib/social/platformCaptions/writePlatformCaptions'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Writes the main caption and/or each platform's caption, headline, title and tags in one AI call. */
export async function POST(req: NextRequest) {
  const ctx = await requirePaidBusinessAccess()
  if (!ctx.ok) return ctx.response
  const { user, businessId, db } = ctx

  const parsed = parsePlatformCaptionsRequest(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.message }, { status: 400 })
  const request = parsed.value

  let refund: { businessId: string; actionId: string } | null = null
  try {
    const credit = await consumeAiCredits(db, {
      businessId,
      feature: 'social_caption',
      actionId: `platform-captions:${user.id}:${crypto.randomUUID()}`,
      sourceType: 'social_caption',
      sourceId: request.assetId ?? request.renderId ?? request.jobId,
    })
    refund = { businessId, actionId: credit.actionId }
    const { lines } = await loadPlatformCaptionContext(db, businessId, request)
    const result = await writePlatformCaptions({ businessId, request, lines })
    return NextResponse.json(result)
  } catch (err) {
    if (refund) await refundAiCredits(db, refund).catch((e) => console.error('[PlatformCaptions] refund failed', e))
    console.error('[PlatformCaptions] failed', { businessId, err })
    const message = err instanceof Error ? err.message : 'Could not write the captions'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
