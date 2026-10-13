import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { X_SCOPES, canUseXConnectDemo } from '@/lib/social/x/xConfig'

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(new URL(req.url).origin, returnPath)

  if (!canUseXConnectDemo()) {
    return NextResponse.redirect(`${base}?x_error=x_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(`${base}?x_error=server_error`)

  const { error } = await ctx.db
    .from('businesses')
    .update({
      x_user_id: `demo-x-${ctx.businessId}`,
      x_username: 'demofarmstand',
      x_profile_image_url: null,
      x_access_token: 'demo-x-access-token',
      x_refresh_token: 'demo-x-refresh-token',
      x_token_expires_at: new Date(Date.now() + TWO_HOURS_MS).toISOString(),
      x_scopes: X_SCOPES.join(' '),
    })
    .eq('id', ctx.businessId)

  if (error) {
    console.error('[X demo connect] Update failed', error)
    return NextResponse.redirect(`${base}?x_error=server_error`)
  }
  return NextResponse.redirect(`${base}?x_connected=1&x_demo=1`)
}
