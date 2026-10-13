import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { isPinterestConnectEnabled, pinterestOAuthRedirectUri } from '@/lib/social/pinterest/pinterestConfig'
import { getPinterestOAuthUrl } from '@/lib/social/pinterest/pinterestOAuth'
import { encodePinterestOAuthState } from '@/lib/social/pinterest/pinterestOAuthState'

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const origin = new URL(req.url).origin
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(origin, returnPath)

  if (!isPinterestConnectEnabled()) {
    return NextResponse.redirect(`${base}?pinterest_error=pinterest_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(base)

  try {
    const state = encodePinterestOAuthState({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      returnPath,
    })
    const redirectUri = pinterestOAuthRedirectUri(req.nextUrl.hostname)
    return NextResponse.redirect(getPinterestOAuthUrl(state, redirectUri))
  } catch (err) {
    console.error('[Pinterest connect] Could not build OAuth URL', err)
    return NextResponse.redirect(`${base}?pinterest_error=server_error`)
  }
}
