import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { exchangeMetaCode, getMetaPages, metaOAuthRedirectUri } from '@/lib/socialPlatforms'
import { createMetaConnectPendingSession } from '@/lib/social/metaConnectPendingCache'
import { filterPagesForInstagramConnect } from '@/lib/social/metaConnectComplete'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const origin = new URL(req.url).origin

  function returnUrl(returnPath?: string | null, query?: string): string {
    const base = integrationsBaseUrl(origin, returnPath)
    return query ? `${base}?${query}` : base
  }

  let stateReturnPath: string | null = null
  if (stateParam) {
    try {
      const state = JSON.parse(Buffer.from(stateParam, 'base64').toString()) as {
        returnPath?: string | null
      }
      stateReturnPath = typeof state.returnPath === 'string' ? state.returnPath : null
    } catch {
      stateReturnPath = null
    }
  }

  if (error || !code || !stateParam) {
    const errCode = error === 'access_denied' ? 'cancelled' : (error || 'cancelled')
    return NextResponse.redirect(
      returnUrl(stateReturnPath, `meta_error=${encodeURIComponent(errCode)}`),
    )
  }

  try {
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString()) as {
      businessId: string
      userId: string
      platform?: 'facebook' | 'instagram'
      returnPath?: string | null
    }
    const returnBase = integrationsBaseUrl(origin, state.returnPath)
    const { businessId, userId } = state
    const platform = state.platform === 'instagram' ? 'instagram' : 'facebook'

    const tokenResult = await exchangeMetaCode(code, metaOAuthRedirectUri(req.nextUrl.hostname))
    const pages = await getMetaPages(tokenResult.accessToken)
    if (!pages.length) {
      return NextResponse.redirect(`${returnBase}?meta_error=no_pages_found`)
    }

    const db = await createServiceClient()

    let pickerPages = pages
    if (platform === 'instagram') {
      const { data: biz } = await db
        .from('businesses')
        .select('facebook_page_id')
        .eq('id', businessId)
        .single()

      if (!biz?.facebook_page_id) {
        return NextResponse.redirect(`${returnBase}?meta_error=instagram_requires_facebook`)
      }

      pickerPages = filterPagesForInstagramConnect(pages, biz.facebook_page_id)
      if (!pickerPages.length) {
        return NextResponse.redirect(`${returnBase}?meta_error=no_instagram_linked`)
      }
    }

    const sessionId = await createMetaConnectPendingSession({
      businessId,
      userId,
      platform,
      pages: pickerPages,
    }, db)

    return NextResponse.redirect(
      `${returnBase}?meta_pick=${encodeURIComponent(sessionId)}`,
    )
  } catch (err) {
    console.error('[Meta callback]', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.toLowerCase().includes('no facebook pages')) {
      return NextResponse.redirect(
        returnUrl(stateReturnPath, 'meta_error=no_pages_found'),
      )
    }
    return NextResponse.redirect(
      returnUrl(stateReturnPath, 'meta_error=server_error'),
    )
  }
}
