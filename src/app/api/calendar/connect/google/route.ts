import { NextRequest, NextResponse } from 'next/server'
import { requireOwnerWrite } from '@/lib/session'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { isGoogleCalendarConnectEnabled } from '@/lib/calendar-sync/google/config'
import { googleCalendarAuthUrl } from '@/lib/calendar-sync/google/oauth'
import { encodeCalendarOAuthState } from '@/lib/calendar-sync/oauthState'
import { calendarReturnUrl } from '@/lib/calendar-sync/paths'

export async function GET(req: NextRequest) {
  const { owner } = await requireOwnerWrite()
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const back = calendarReturnUrl(req.url, returnPath)

  if (!isGoogleCalendarConnectEnabled()) {
    back.searchParams.set('calendar_error', 'not_enabled')
    return NextResponse.redirect(back)
  }

  try {
    return NextResponse.redirect(googleCalendarAuthUrl(encodeCalendarOAuthState(owner.id, returnPath)))
  } catch (err) {
    console.error('[Google Calendar connect] Could not build OAuth URL', err)
    back.searchParams.set('calendar_error', 'server_error')
    return NextResponse.redirect(back)
  }
}
