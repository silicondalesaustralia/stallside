import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { isTikTokConnectEnabled, tiktokOAuthRedirectUri } from '@/lib/social/tiktok/tiktokConfig'
import { getTikTokOAuthUrl } from '@/lib/social/tiktok/tiktokOAuth'
import { encodeTikTokOAuthState } from '@/lib/social/tiktok/tiktokOAuthState'

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const origin = new URL(req.url).origin
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(origin, returnPath)

  if (!isTikTokConnectEnabled()) {
    return NextResponse.redirect(`${base}?tiktok_error=tiktok_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(base)

  try {
    const state = encodeTikTokOAuthState({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      returnPath,
    })
    const redirectUri = tiktokOAuthRedirectUri(req.nextUrl.hostname)
    return NextResponse.redirect(getTikTokOAuthUrl(state, redirectUri))
  } catch (err) {
    console.error('[TikTok connect] Could not build OAuth URL', err)
    return NextResponse.redirect(`${base}?tiktok_error=server_error`)
  }
}
