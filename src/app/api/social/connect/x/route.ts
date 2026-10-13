import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { isXConnectEnabled, xOAuthRedirectUri } from '@/lib/social/x/xConfig'
import { createXPkcePair, getXOAuthUrl } from '@/lib/social/x/xOAuth'
import { encodeXOAuthState } from '@/lib/social/x/xOAuthState'
import { setXPkceCookie } from '@/lib/social/x/xPkceCookie'

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const origin = new URL(req.url).origin
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(origin, returnPath)

  if (!isXConnectEnabled()) {
    return NextResponse.redirect(`${base}?x_error=x_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(base)

  try {
    const state = encodeXOAuthState({ businessId: ctx.businessId, userId: ctx.user.id, returnPath })
    const { verifier, challenge } = createXPkcePair()
    const res = NextResponse.redirect(getXOAuthUrl(state, xOAuthRedirectUri(req.nextUrl.hostname), challenge))
    setXPkceCookie(res, verifier)
    return res
  } catch (err) {
    console.error('[X connect] Could not build OAuth URL', err)
    return NextResponse.redirect(`${base}?x_error=server_error`)
  }
}
