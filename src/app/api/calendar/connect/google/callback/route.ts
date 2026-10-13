import { NextRequest, NextResponse, after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encryptSecret } from '@/lib/square/crypto'
import { GOOGLE_CALENDAR_SCOPES } from '@/lib/calendar-sync/google/config'
import { exchangeGoogleCalendarCode, fetchGoogleAccountEmail } from '@/lib/calendar-sync/google/oauth'
import { decodeCalendarOAuthState } from '@/lib/calendar-sync/oauthState'
import { syncCalendarExports } from '@/lib/calendar-sync/export'
import { calendarReturnUrl } from '@/lib/calendar-sync/paths'

const REQUIRED_SCOPES = GOOGLE_CALENDAR_SCOPES.filter((s) => s.startsWith('https://'))

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const state = decodeCalendarOAuthState(searchParams.get('state'))
  const back = calendarReturnUrl(req.url, state?.returnPath ?? null)
  const fail = (code: string) => {
    back.searchParams.set('calendar_error', code)
    return NextResponse.redirect(back)
  }

  const code = searchParams.get('code')
  if (searchParams.get('error') || !code) return fail('cancelled')
  if (!state) return fail('invalid_state')

  try {
    const tokens = await exchangeGoogleCalendarCode(code)
    if (!REQUIRED_SCOPES.every((s) => tokens.scopes.includes(s))) return fail('missing_permissions')
    const accountEmail = await fetchGoogleAccountEmail(tokens.accessToken)

    const existing = await prisma.calendarConnection.findUnique({
      where: { ownerId_provider: { ownerId: state.ownerId, provider: 'GOOGLE' } },
      select: { accountEmail: true },
    })
    const sameAccount = existing?.accountEmail === accountEmail

    const tokenFields = {
      accountEmail,
      accessTokenEnc: encryptSecret(tokens.accessToken),
      tokenExpiresAt: tokens.expiresAt,
      scopes: tokens.scopes,
      lastError: null,
    }
    await prisma.calendarConnection.upsert({
      where: { ownerId_provider: { ownerId: state.ownerId, provider: 'GOOGLE' } },
      create: {
        ownerId: state.ownerId,
        provider: 'GOOGLE',
        ...tokenFields,
        refreshTokenEnc: tokens.refreshToken ? encryptSecret(tokens.refreshToken) : null,
      },
      update: {
        ...tokenFields,
        ...(tokens.refreshToken ? { refreshTokenEnc: encryptSecret(tokens.refreshToken) } : {}),
        ...(sameAccount ? {} : { exportCalendarId: null }),
      },
    })

    after(async () => {
      try {
        await syncCalendarExports(state.ownerId)
      } catch (err) {
        console.error('[Google Calendar callback] Initial export failed', err)
      }
    })

    back.searchParams.set('calendar_connected', 'google')
    return NextResponse.redirect(back)
  } catch (err) {
    console.error('[Google Calendar callback]', err)
    return fail('server_error')
  }
}
