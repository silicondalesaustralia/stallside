import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { isYouTubeConnectEnabled, youtubeOAuthRedirectUri } from '@/lib/social/youtube/youtubeConfig'
import { getYouTubeOAuthUrl } from '@/lib/social/youtube/youtubeOAuth'
import { encodeYouTubeOAuthState } from '@/lib/social/youtube/youtubeOAuthState'

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const origin = new URL(req.url).origin
  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
  const base = integrationsBaseUrl(origin, returnPath)

  if (!isYouTubeConnectEnabled()) {
    return NextResponse.redirect(`${base}?youtube_error=youtube_not_enabled`)
  }
  if (!ctx.ok) return NextResponse.redirect(base)

  try {
    const state = encodeYouTubeOAuthState({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      returnPath,
    })
    const redirectUri = youtubeOAuthRedirectUri(req.nextUrl.hostname)
    return NextResponse.redirect(getYouTubeOAuthUrl(state, redirectUri))
  } catch (err) {
    console.error('[YouTube connect] Could not build OAuth URL', err)
    return NextResponse.redirect(`${base}?youtube_error=server_error`)
  }
}
