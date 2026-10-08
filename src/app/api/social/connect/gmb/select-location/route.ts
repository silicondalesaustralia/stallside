import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { completeGmbLocationConnection } from '@/lib/social/gmbConnectComplete'
import { consumeGmbConnectPendingSession } from '@/lib/social/gmbConnectPendingCache'

export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { user, businessId, db } = ctx

  const body = await req.json() as { sessionId?: string; locationId?: string }
  const { sessionId, locationId } = body
  if (!sessionId || !locationId) {
    return NextResponse.json({ error: 'Missing sessionId or locationId' }, { status: 400 })
  }

  const session = consumeGmbConnectPendingSession(sessionId)
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
  }

  const location = session.locations.find((loc) => loc.locationId === locationId)
  if (!location) {
    return NextResponse.json({ error: 'location_not_found' }, { status: 400 })
  }

  if (businessId !== session.businessId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await completeGmbLocationConnection(
    db,
    session.businessId,
    session.accountId,
    location,
    {
      accessToken:    session.accessToken,
      refreshToken:   session.refreshToken,
      tokenExpiresAt: session.tokenExpiresAt,
    },
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    ok:   true,
    demo: !!session.demo,
  })
}
