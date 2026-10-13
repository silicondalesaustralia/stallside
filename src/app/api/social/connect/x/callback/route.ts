import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { X_SCOPES, xOAuthRedirectUri } from '@/lib/social/x/xConfig'
import { exchangeXCode, parseXScopes, xTokenColumns } from '@/lib/social/x/xOAuth'
import { getXAccount } from '@/lib/social/x/xApi'
import { decodeXOAuthState, peekXReturnPath } from '@/lib/social/x/xOAuthState'
import { X_PKCE_COOKIE, clearXPkceCookie } from '@/lib/social/x/xPkceCookie'

function redirectClearing(url: string) {
  const res = NextResponse.redirect(url)
  clearXPkceCookie(res)
  return res
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const origin = new URL(req.url).origin
  const fallbackBase = integrationsBaseUrl(origin, peekXReturnPath(stateParam))

  if (error || !code) {
    const errCode = error === 'access_denied' ? 'cancelled' : error || 'cancelled'
    return redirectClearing(`${fallbackBase}?x_error=${encodeURIComponent(errCode)}`)
  }

  const state = decodeXOAuthState(stateParam)
  const verifier = req.cookies.get(X_PKCE_COOKIE)?.value
  if (!state || !verifier) {
    return redirectClearing(`${fallbackBase}?x_error=invalid_state`)
  }
  const base = integrationsBaseUrl(origin, state.returnPath)

  try {
    const token = await exchangeXCode(code, xOAuthRedirectUri(req.nextUrl.hostname), verifier)
    const granted = parseXScopes(token.scope)
    if (!X_SCOPES.every((s) => granted.includes(s))) {
      return redirectClearing(`${base}?x_error=missing_permissions`)
    }
    const account = await getXAccount(token.access_token)

    const db = await createServiceClient()
    const { error: updateError } = await db
      .from('businesses')
      .update({
        ...xTokenColumns(token),
        x_user_id: account.id,
        x_username: account.username,
        x_profile_image_url: account.profileImageUrl,
      })
      .eq('id', state.businessId)

    if (updateError) {
      console.error('[X callback] Saving connection failed', updateError)
      return redirectClearing(`${base}?x_error=server_error`)
    }
    return redirectClearing(`${base}?x_connected=1`)
  } catch (err) {
    console.error('[X callback]', err)
    return redirectClearing(`${base}?x_error=server_error`)
  }
}
