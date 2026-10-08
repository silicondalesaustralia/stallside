import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { cancelScheduledSocialPost } from '@/lib/social/socialPostCancellation'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const result = await cancelScheduledSocialPost(db, businessId, id)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  await db
    .from('social_week_plan_items')
    .update({
      scheduled_social_post_id: null,
      review_status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('scheduled_social_post_id', id)
    .eq('business_id', businessId)

  return NextResponse.json({ ok: true, alreadyCancelled: result.alreadyCancelled })
}
