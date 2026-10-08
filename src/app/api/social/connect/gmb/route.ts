import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import {
  gmbIntegrationsBaseUrl,
  gmbOAuthRedirectUri,
  isGmbConnectEnabled,
} from '@/lib/social/gmbConnectConfig'
import { parseOAuthReturnPath } from '@/lib/products/productRoutes'
import { getGmbOAuthClientId } from '@/lib/social/gmbOAuthCredentials'

export async function GET(req: NextRequest) {
  const ctx = await requireSocialConnectionManage()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (!isGmbConnectEnabled()) {
    const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
    return NextResponse.redirect(
      `${gmbIntegrationsBaseUrl(new URL(req.url).origin, returnPath)}?gmb_error=gmb_not_enabled`,
    )
  }

  if (!ctx.ok) {
    const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))
    const code = ctx.response.status === 403 ? 'forbidden' : 'server_error'
    return NextResponse.redirect(`${gmbIntegrationsBaseUrl(new URL(req.url).origin, returnPath)}?gmb_error=${code}`)
  }
  const { user, businessId } = ctx

  const returnPath = parseOAuthReturnPath(req.nextUrl.searchParams.get('returnPath'))

  const state = Buffer.from(JSON.stringify({
    businessId,
    userId:     user.id,
    source:     'gmb',
    returnPath,
  })).toString('base64')

  const clientId = getGmbOAuthClientId()
  const redirectUri = gmbOAuthRedirectUri()
  const scopes = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/business.manage',
  ].join(' ')

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(state)}`

  return NextResponse.redirect(url)
}
