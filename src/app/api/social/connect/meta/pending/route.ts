import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { getMetaConnectPendingSession } from '@/lib/social/metaConnectPendingCache'

export async function GET(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { user, businessId, db } = ctx

  const sessionId = req.nextUrl.searchParams.get('session')
  if (!sessionId) return NextResponse.json({ error: 'Missing session' }, { status: 400 })

  const session = await getMetaConnectPendingSession(sessionId, db)
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 404 })
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
  }

  return NextResponse.json({
    platform: session.platform,
    demo:     !!session.demo,
    pages:    session.pages.map((p) => ({
      id:   p.id,
      name: p.name,
      instagramUsername: p.instagram_business_account?.username ?? null,
      hasInstagram:      !!p.instagram_business_account?.id,
    })),
    linkedFacebookPageId,
  })
}
