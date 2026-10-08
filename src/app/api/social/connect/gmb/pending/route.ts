import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { getGmbConnectPendingSession } from '@/lib/social/gmbConnectPendingCache'

export async function GET(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { user, businessId } = ctx

  const sessionId = req.nextUrl.searchParams.get('session')
  if (!sessionId) return NextResponse.json({ error: 'Missing session' }, { status: 400 })

  const session = getGmbConnectPendingSession(sessionId)
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 404 })
  }

  if (businessId !== session.businessId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({
    demo:        !!session.demo,
    accountName: session.accountName,
    locations:   session.locations.map((loc) => ({
      id:    loc.locationId,
      title: loc.title,
    })),
  })
}
