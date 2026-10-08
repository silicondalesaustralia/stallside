import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { getGmbAccounts, getGmbLocations, type GmbLocation } from '@/lib/socialPlatforms'
import { gmbTokenExpiresAtFromOAuthResponse } from '@/lib/social/gmbAuth'
import { completeGmbLocationConnection } from '@/lib/social/gmbConnectComplete'
import { createGmbConnectPendingSession, type GmbPendingLocation } from '@/lib/social/gmbConnectPendingCache'
import { gmbIntegrationsBaseUrl, gmbOAuthRedirectUri } from '@/lib/social/gmbConnectConfig'
import { requireGmbOAuthCredentials } from '@/lib/social/gmbOAuthCredentials'

function mapLocations(locations: GmbLocation[]): GmbPendingLocation[] {
  return locations.map((loc) => ({
    locationResourceName: loc.name,
    locationId:           loc.name.split('/').pop() || '',
    title:                loc.title,
  })).filter((loc) => loc.locationId)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const base = gmbIntegrationsBaseUrl(new URL(req.url).origin)

  if (error || !code || !stateParam) {
    const errCode = error === 'access_denied' ? 'cancelled' : (error || 'cancelled')
    return NextResponse.redirect(`${base}?gmb_error=${encodeURIComponent(errCode)}`)
  }

  try {
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString()) as {
      businessId: string
      userId: string
      returnPath?: string | null
    }
    const returnBase = gmbIntegrationsBaseUrl(new URL(req.url).origin, state.returnPath)
    const { businessId, userId } = state

    const ctx = await requireEffectiveBusinessContext()
    if (!ctx.ok) {
      if (ctx.response.status === 401) {
        return NextResponse.redirect(`${returnBase}?gmb_error=server_error`)
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { user, businessId: effectiveBusinessId, db } = ctx
    if (user.id !== userId) {
      return NextResponse.redirect(`${returnBase}?gmb_error=server_error`)
    }
    if (effectiveBusinessId !== businessId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const ownedBusinessId = effectiveBusinessId

    const { clientId, clientSecret } = requireGmbOAuthCredentials()
    const redirectUri = gmbOAuthRedirectUri()

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     clientId || '',
        client_secret: clientSecret || '',
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (tokens.error) throw new Error(tokens.error_description || tokens.error)

    const { access_token, refresh_token } = tokens
    const tokenExpiresAt = gmbTokenExpiresAtFromOAuthResponse(tokens)

    const accounts = await getGmbAccounts(access_token)
    if (!accounts.length) {
      return NextResponse.redirect(`${returnBase}?gmb_error=no_accounts_found`)
    }

    const account = accounts[0]
    const accountId = account.name.split('/')[1] || account.name.replace(/^accounts\//, '')

    const locations = await getGmbLocations(account.name, access_token)
    const mapped = mapLocations(locations)
    if (!mapped.length) {
      return NextResponse.redirect(`${returnBase}?gmb_error=no_locations_found`)
    }

    const tokenPayload = {
      accessToken:    access_token as string,
      refreshToken:   (refresh_token as string | undefined) ?? null,
      tokenExpiresAt,
    }

    if (mapped.length === 1) {
      await completeGmbLocationConnection(
        db,
        ownedBusinessId,
        accountId,
        mapped[0],
        tokenPayload,
      )
      return NextResponse.redirect(`${returnBase}?gmb_connected=1`)
    }

    const sessionId = createGmbConnectPendingSession({
      businessId: ownedBusinessId,
      userId,
      accountId,
      accountName: account.accountName || account.name,
      accessToken: tokenPayload.accessToken,
      refreshToken: tokenPayload.refreshToken,
      tokenExpiresAt: tokenPayload.tokenExpiresAt,
      locations: mapped,
    })

    return NextResponse.redirect(
      `${returnBase}?gmb_pick=${encodeURIComponent(sessionId)}`,
    )
  } catch (err) {
    console.error('[GMB callback]', err)
    return NextResponse.redirect(`${base}?gmb_error=server_error`)
  }
}
