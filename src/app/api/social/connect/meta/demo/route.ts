import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import {
  canUseMetaConnectDemo,
  integrationsBaseUrl,
} from '@/lib/social/metaConnectConfig'
import { createMetaConnectPendingSession } from '@/lib/social/metaConnectPendingCache'
import { getDemoMetaPages } from '@/lib/social/metaConnectComplete'

export async function GET(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok && ctx.response.status === 401) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (!canUseMetaConnectDemo()) {
    return NextResponse.redirect(
      `${integrationsBaseUrl(new URL(req.url).origin)}?meta_error=meta_not_enabled`,
    )
  }

  if (!ctx.ok) {
    return NextResponse.redirect(`${integrationsBaseUrl(new URL(req.url).origin)}?meta_error=server_error`)
  }
  const { user, businessId, db } = ctx

  const platformParam = req.nextUrl.searchParams.get('platform')
  const platform: 'facebook' | 'instagram' =
    platformParam === 'instagram' ? 'instagram' : 'facebook'

  const pages = getDemoMetaPages(platform)
  if (!pages.length) {
    return NextResponse.redirect(
      `${integrationsBaseUrl(new URL(req.url).origin)}?meta_error=${platform === 'instagram' ? 'no_instagram_linked' : 'no_pages_found'}`,
    )
  }

  const sessionId = await createMetaConnectPendingSession({
    businessId,
    userId:     user.id,
    platform,
    pages,
    demo:       true,
  }, db)

  return NextResponse.redirect(
    `${integrationsBaseUrl(new URL(req.url).origin)}?meta_pick=${encodeURIComponent(sessionId)}&meta_demo=1`,
  )
}
