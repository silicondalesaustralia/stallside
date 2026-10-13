import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { PINTEREST_SCOPES, canUsePinterestConnectDemo } from '@/lib/social/pinterest/pinterestConfig'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(new URL(req.url).origin, returnPath)

  if (!canUsePinterestConnectDemo()) {
    return NextResponse.redirect(`${base}?pinterest_error=pinterest_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(`${base}?pinterest_error=server_error`)

  const { error } = await ctx.db
    .from('businesses')
    .update({
      pinterest_user_id: `demo-pinner-${ctx.businessId}`,
      pinterest_username: 'demofarmstand',
      pinterest_profile_image_url: null,
      pinterest_access_token: 'demo-pinterest-access-token',
      pinterest_refresh_token: 'demo-pinterest-refresh-token',
      pinterest_token_expires_at: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
      pinterest_scopes: PINTEREST_SCOPES.join(' '),
    })
    .eq('id', ctx.businessId)

  if (error) {
    console.error('[Pinterest demo connect] Update failed', error)
    return NextResponse.redirect(`${base}?pinterest_error=server_error`)
  }
  return NextResponse.redirect(`${base}?pinterest_connected=1&pinterest_demo=1`)
}
