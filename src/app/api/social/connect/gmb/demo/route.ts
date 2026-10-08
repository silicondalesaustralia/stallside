import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import {
  canUseGmbConnectDemo,
  gmbIntegrationsBaseUrl,
} from '@/lib/social/gmbConnectConfig'
import { createGmbConnectPendingSession } from '@/lib/social/gmbConnectPendingCache'
import { getDemoGmbPendingSession } from '@/lib/social/gmbConnectComplete'

export async function GET(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (!canUseGmbConnectDemo()) {
    return NextResponse.redirect(
      `${gmbIntegrationsBaseUrl(new URL(req.url).origin)}?gmb_error=gmb_not_enabled`,
    )
  }

  if (!ctx.ok) {
    return NextResponse.redirect(`${gmbIntegrationsBaseUrl(new URL(req.url).origin)}?gmb_error=server_error`)
  }
  const { user, businessId } = ctx

  const demo = getDemoGmbPendingSession()
  const sessionId = createGmbConnectPendingSession({
    businessId,
    userId:         user.id,
    accountId:      demo.accountId,
    accountName:    demo.accountName,
    accessToken:    demo.tokens.accessToken,
    refreshToken:   demo.tokens.refreshToken,
    tokenExpiresAt: demo.tokens.tokenExpiresAt,
    locations:      demo.locations,
    demo:           true,
  })

  return NextResponse.redirect(
    `${gmbIntegrationsBaseUrl(new URL(req.url).origin)}?gmb_pick=${encodeURIComponent(sessionId)}&gmb_demo=1`,
  )
}
