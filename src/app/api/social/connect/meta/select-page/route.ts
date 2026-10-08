import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import {
  completeMetaPageConnection,
  filterPagesForInstagramConnect,
} from '@/lib/social/metaConnectComplete'
import { consumeMetaConnectPendingSession } from '@/lib/social/metaConnectPendingCache'

export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { user, businessId, db } = ctx

  const body = await req.json() as { sessionId?: string; pageId?: string }
  const { sessionId, pageId } = body
  if (!sessionId || !pageId) {
    return NextResponse.json({ error: 'Missing sessionId or pageId' }, { status: 400 })
  }

  const session = await consumeMetaConnectPendingSession(sessionId, db)
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
  }

  const page = session.pages.find((p) => p.id === pageId)
  if (!page) {
    return NextResponse.json({ error: 'page_not_found' }, { status: 400 })
  }

  if (businessId !== session.businessId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let linkedFacebookPageId: string | null = null
  if (session.platform === 'instagram') {
    const { data: biz } = await db
      .from('businesses')
      .select('facebook_page_id')
      .eq('id', session.businessId)
      .single()
    linkedFacebookPageId = biz?.facebook_page_id ?? null

    const allowed = filterPagesForInstagramConnect(session.pages, linkedFacebookPageId)
    if (!allowed.some((p) => p.id === pageId)) {
      return NextResponse.json({ error: 'no_instagram_linked' }, { status: 400 })
    }
  }

  const result = await completeMetaPageConnection(
    db,
    session.businessId,
    session.platform,
    page,
    { linkedFacebookPageId },
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    platform: session.platform,
    demo:     !!session.demo,
  })
}
