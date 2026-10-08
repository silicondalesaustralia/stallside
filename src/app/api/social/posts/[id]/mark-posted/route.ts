import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { markManualSocialPostPosted } from '@/lib/social/weekPlan/weekPlanReset'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  try {
    const result = await markManualSocialPostPosted(db, businessId, id)
    return NextResponse.json({
      ok: true,
      alreadyPosted: result.alreadyPosted,
      postedAt: result.postedAt,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not mark as posted'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
