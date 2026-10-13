import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { YOUTUBE_SCOPES, canUseYouTubeConnectDemo } from '@/lib/social/youtube/youtubeConfig'

const HOUR_MS = 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(new URL(req.url).origin, returnPath)

  if (!canUseYouTubeConnectDemo()) {
    return NextResponse.redirect(`${base}?youtube_error=youtube_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(`${base}?youtube_error=server_error`)

  const { error } = await ctx.db
    .from('businesses')
    .update({
      youtube_channel_id: `demo-channel-${ctx.businessId}`,
      youtube_channel_title: 'Demo Farm Stand',
      youtube_channel_thumbnail_url: null,
      youtube_access_token: 'demo-youtube-access-token',
      youtube_refresh_token: 'demo-youtube-refresh-token',
      youtube_token_expires_at: new Date(Date.now() + HOUR_MS).toISOString(),
      youtube_scopes: YOUTUBE_SCOPES.join(' '),
    })
    .eq('id', ctx.businessId)

  if (error) {
    console.error('[YouTube demo connect] Update failed', error)
    return NextResponse.redirect(`${base}?youtube_error=server_error`)
  }
  return NextResponse.redirect(`${base}?youtube_connected=1&youtube_demo=1`)
}
