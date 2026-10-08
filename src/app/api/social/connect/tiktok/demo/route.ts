import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { canUseTikTokConnectDemo } from '@/lib/social/tiktok/tiktokConfig'

const DAY_MS = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(new URL(req.url).origin, returnPath)

  if (!canUseTikTokConnectDemo()) {
    return NextResponse.redirect(`${base}?tiktok_error=tiktok_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(`${base}?tiktok_error=server_error`)

  const now = Date.now()
  const { error } = await ctx.db
    .from('businesses')
    .update({
      tiktok_open_id: `demo-open-id-${ctx.businessId}`,
      tiktok_display_name: 'Demo Stall',
      tiktok_avatar_url: null,
      tiktok_access_token: 'demo-tiktok-access-token',
      tiktok_refresh_token: 'demo-tiktok-refresh-token',
      tiktok_token_expires_at: new Date(now + DAY_MS).toISOString(),
      tiktok_refresh_expires_at: new Date(now + 365 * DAY_MS).toISOString(),
      tiktok_scopes: 'user.info.basic,video.publish',
    })
    .eq('id', ctx.businessId)

  if (error) {
    console.error('[TikTok demo connect] Update failed', error)
    return NextResponse.redirect(`${base}?tiktok_error=server_error`)
  }
  return NextResponse.redirect(`${base}?tiktok_connected=1&tiktok_demo=1`)
}
