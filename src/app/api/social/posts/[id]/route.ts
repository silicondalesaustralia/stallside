import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { rescheduleSocialPost } from '@/lib/social/rescheduleSocialPost'
import { isPublishedHistoryImmutable } from '@/lib/social/socialPostTypes'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { data: post, error } = await db
    .from('social_posts')
    .select('*')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (error || !post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const body = await req.json()
  if (body.scheduled_for === undefined) {
    return NextResponse.json({ error: 'scheduled_for is required' }, { status: 400 })
  }

  const { data: biz } = await db
    .from('businesses')
    .select('timezone')
    .eq('id', businessId)
    .single()

  try {
    const { post } = await rescheduleSocialPost(
      db,
      businessId,
      id,
      body.scheduled_for as string,
      (biz?.timezone as string) ?? 'Australia/Sydney',
    )
    return NextResponse.json({ post })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reschedule failed'
    const status =
      message === 'Post not found' ? 404
      : message.includes('cannot') ? 409
      : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { data: existing, error: loadErr } = await db
    .from('social_posts')
    .select('status')
    .eq('id', id)
    .eq('business_id', businessId)
    .single()

  if (loadErr || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (isPublishedHistoryImmutable(existing)) {
    return NextResponse.json(
      { error: 'Published posts cannot be deleted. They remain in your history.' },
      { status: 409 },
    )
  }

  if (existing.status === 'scheduled') {
    return NextResponse.json(
      { error: 'Use cancel instead of delete for scheduled posts' },
      { status: 409 },
    )
  }

  const { error } = await db
    .from('social_posts')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
