import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { TIKTOK_SCOPES, tiktokOAuthRedirectUri } from '@/lib/social/tiktok/tiktokConfig'
import {
  exchangeTikTokCode,
  getTikTokUserInfo,
  tiktokTokenColumns,
} from '@/lib/social/tiktok/tiktokOAuth'
import { decodeTikTokOAuthState, peekTikTokReturnPath } from '@/lib/social/tiktok/tiktokOAuthState'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const origin = new URL(req.url).origin
  const fallbackBase = integrationsBaseUrl(origin, peekTikTokReturnPath(stateParam))

  if (error || !code) {
    const errCode = error === 'access_denied' ? 'cancelled' : error || 'cancelled'
    return NextResponse.redirect(`${fallbackBase}?tiktok_error=${encodeURIComponent(errCode)}`)
  }

  const state = decodeTikTokOAuthState(stateParam)
  if (!state) {
    return NextResponse.redirect(`${fallbackBase}?tiktok_error=invalid_state`)
  }
  const base = integrationsBaseUrl(origin, state.returnPath)

  try {
    const token = await exchangeTikTokCode(code, tiktokOAuthRedirectUri(req.nextUrl.hostname))
    const granted = token.scope.split(',').map((s) => s.trim())
    if (!TIKTOK_SCOPES.every((s) => granted.includes(s))) {
      return NextResponse.redirect(`${base}?tiktok_error=missing_permissions`)
    }
    const profile = await getTikTokUserInfo(token.access_token)

    const db = await createServiceClient()
    const { error: updateError } = await db
      .from('businesses')
      .update({
        ...tiktokTokenColumns(token),
        tiktok_open_id: profile.open_id,
        tiktok_display_name: profile.display_name ?? null,
        tiktok_avatar_url: profile.avatar_url ?? null,
      })
      .eq('id', state.businessId)

    if (updateError) {
      console.error('[TikTok callback] Saving connection failed', updateError)
      return NextResponse.redirect(`${base}?tiktok_error=server_error`)
    }
    return NextResponse.redirect(`${base}?tiktok_connected=1`)
  } catch (err) {
    console.error('[TikTok callback]', err)
    return NextResponse.redirect(`${base}?tiktok_error=server_error`)
  }
}
