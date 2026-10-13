import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { integrationsBaseUrl } from '@/lib/social/metaConnectConfig'
import { YOUTUBE_SCOPES, youtubeOAuthRedirectUri } from '@/lib/social/youtube/youtubeConfig'
import {
  exchangeYouTubeCode,
  getYouTubeChannel,
  youtubeTokenColumns,
} from '@/lib/social/youtube/youtubeOAuth'
import { decodeYouTubeOAuthState, peekYouTubeReturnPath } from '@/lib/social/youtube/youtubeOAuthState'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const origin = new URL(req.url).origin
  const fallbackBase = integrationsBaseUrl(origin, peekYouTubeReturnPath(stateParam))

  if (error || !code) {
    const errCode = error === 'access_denied' ? 'cancelled' : error || 'cancelled'
    return NextResponse.redirect(`${fallbackBase}?youtube_error=${encodeURIComponent(errCode)}`)
  }

  const state = decodeYouTubeOAuthState(stateParam)
  if (!state) {
    return NextResponse.redirect(`${fallbackBase}?youtube_error=invalid_state`)
  }
  const base = integrationsBaseUrl(origin, state.returnPath)

  try {
    const token = await exchangeYouTubeCode(code, youtubeOAuthRedirectUri(req.nextUrl.hostname))
    const granted = token.scope.split(' ').map((s) => s.trim())
    if (!YOUTUBE_SCOPES.every((s) => granted.includes(s))) {
      return NextResponse.redirect(`${base}?youtube_error=missing_permissions`)
    }
    const channel = await getYouTubeChannel(token.access_token)
    if (!channel) {
      return NextResponse.redirect(`${base}?youtube_error=no_channel`)
    }

    const db = await createServiceClient()
    const { error: updateError } = await db
      .from('businesses')
      .update({
        ...youtubeTokenColumns(token),
        youtube_channel_id: channel.id,
        youtube_channel_title: channel.title,
        youtube_channel_thumbnail_url: channel.thumbnailUrl,
      })
      .eq('id', state.businessId)

    if (updateError) {
      console.error('[YouTube callback] Saving connection failed', updateError)
      return NextResponse.redirect(`${base}?youtube_error=server_error`)
    }
    return NextResponse.redirect(`${base}?youtube_connected=1`)
  } catch (err) {
    console.error('[YouTube callback]', err)
    return NextResponse.redirect(`${base}?youtube_error=server_error`)
  }
}
