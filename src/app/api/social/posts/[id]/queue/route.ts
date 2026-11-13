import { NextRequest, NextResponse, after } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { claimPostForPublishing, publishClaimedPost } from '@/lib/social/publishClaimedPost'

// Room for a video download + YouTube upload after the response is sent.
export const maxDuration = 300

/**
 * "Post now": answers straight away and publishes in the background. If the
 * claim fails the post stays due, and the publish-due cron posts it instead.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { data: owned, error } = await db
    .from('social_posts')
    .select('id, status')
    .eq('id', id)
    .eq('business_id', businessId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!owned) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (owned.status !== 'scheduled') {
    return NextResponse.json({ error: 'This post is not waiting to be published' }, { status: 409 })
  }

  const claim = await claimPostForPublishing(db, id)
  if (claim.status === 'claimed') {
    const { post } = claim
    after(async () => {
      await publishClaimedPost(db, post)
    })
  }
  return NextResponse.json({ queued: true }, { status: 202 })
}
