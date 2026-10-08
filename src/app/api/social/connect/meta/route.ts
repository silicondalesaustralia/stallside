import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { getMetaOAuthUrl, metaOAuthRedirectUri } from '@/lib/socialPlatforms'
import {
  integrationsBaseUrl,
  isMetaConnectEnabled,
} from '@/lib/social/metaConnectConfig'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (!isMetaConnectEnabled()) {
    const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
    return NextResponse.redirect(
      `${integrationsBaseUrl(new URL(req.url).origin, returnPath)}?meta_error=meta_not_enabled`,
    )
  }

  if (!ctx.ok) {
    const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
    return NextResponse.redirect(`${integrationsBaseUrl(new URL(req.url).origin, returnPath)}`)
  }
  const { user, businessId, db } = ctx

  const platformParam = req.nextUrl.searchParams.get('platform')
  const platform: 'facebook' | 'instagram' =
    platformParam === 'instagram' ? 'instagram' : 'facebook'

  if (platform === 'instagram') {
    const { data: biz } = await db
      .from('businesses')
      .select('facebook_page_id')
      .eq('id', businessId)
      .single()

    if (!biz?.facebook_page_id) {
      const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
      return NextResponse.redirect(
        `${integrationsBaseUrl(new URL(req.url).origin, returnPath)}?meta_error=instagram_requires_facebook`,
      )
    }
  }

  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))

  const state = Buffer.from(JSON.stringify({
    businessId,
    userId:     user.id,
    platform,
    returnPath,
  })).toString('base64')

  try {
    const redirectUri = metaOAuthRedirectUri(req.nextUrl.hostname)
    return NextResponse.redirect(getMetaOAuthUrl(state, platform, redirectUri))
  } catch (err) {
    console.error('[Meta connect] Could not build OAuth URL', err)
    return NextResponse.redirect(
      `${integrationsBaseUrl(new URL(req.url).origin, returnPath)}?meta_error=server_error`,
    )
  }
}
