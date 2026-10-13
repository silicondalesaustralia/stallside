import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { PINTEREST_SCOPES, pinterestOAuthRedirectUri } from '@/lib/social/pinterest/pinterestConfig'
import {
  exchangePinterestCode,
  parsePinterestScopes,
  pinterestTokenColumns,
} from '@/lib/social/pinterest/pinterestOAuth'
import { getPinterestAccount } from '@/lib/social/pinterest/pinterestApi'
import { decodePinterestOAuthState, peekPinterestReturnPath } from '@/lib/social/pinterest/pinterestOAuthState'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const origin = new URL(req.url).origin
  const fallbackBase = integrationsBaseUrl(origin, peekPinterestReturnPath(stateParam))

  if (error || !code) {
    const errCode = error === 'access_denied' ? 'cancelled' : error || 'cancelled'
    return NextResponse.redirect(`${fallbackBase}?pinterest_error=${encodeURIComponent(errCode)}`)
  }

  const state = decodePinterestOAuthState(stateParam)
  if (!state) {
    return NextResponse.redirect(`${fallbackBase}?pinterest_error=invalid_state`)
  }
  const base = integrationsBaseUrl(origin, state.returnPath)

  try {
    const token = await exchangePinterestCode(code, pinterestOAuthRedirectUri(req.nextUrl.hostname))
    const granted = parsePinterestScopes(token.scope)
    if (!PINTEREST_SCOPES.every((s) => granted.includes(s))) {
      return NextResponse.redirect(`${base}?pinterest_error=missing_permissions`)
    }
    const account = await getPinterestAccount(token.access_token)

    const db = await createServiceClient()
    const { error: updateError } = await db
      .from('businesses')
      .update({
        ...pinterestTokenColumns(token),
        pinterest_user_id: account.id,
        pinterest_username: account.username,
        pinterest_profile_image_url: account.profileImageUrl,
      })
      .eq('id', state.businessId)

    if (updateError) {
      console.error('[Pinterest callback] Saving connection failed', updateError)
      return NextResponse.redirect(`${base}?pinterest_error=server_error`)
    }
    return NextResponse.redirect(`${base}?pinterest_connected=1`)
  } catch (err) {
    console.error('[Pinterest callback]', err)
    return NextResponse.redirect(`${base}?pinterest_error=server_error`)
  }
}
