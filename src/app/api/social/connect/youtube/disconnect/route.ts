import { NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { revokeYouTubeToken } from '@/lib/social/youtube/youtubeOAuth'
import { isYouTubeConnectEnabled } from '@/lib/social/youtube/youtubeConfig'

const CLEARED = {
  youtube_channel_id: null,
  youtube_channel_title: null,
  youtube_channel_thumbnail_url: null,
  youtube_access_token: null,
  youtube_refresh_token: null,
  youtube_token_expires_at: null,
  youtube_scopes: null,
}

type YouTubeTokens = {
  youtube_access_token?: string | null
  youtube_refresh_token?: string | null
}

export async function POST() {
  try {
    const ctx = await requireSocialConnectionManage()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    const { data: biz } = await db
      .from('businesses')
      .select('youtube_access_token, youtube_refresh_token')
      .eq('id', businessId)
      .single()

    const tokens = biz as YouTubeTokens | null
    const token = tokens?.youtube_refresh_token || tokens?.youtube_access_token
    if (token && isYouTubeConnectEnabled()) {
      try {
        await revokeYouTubeToken(token)
      } catch (err) {
        console.warn('[YouTube Disconnect] Revoke failed (clearing locally anyway):', err)
      }
    }

    const { error: updateError } = await db.from('businesses').update(CLEARED).eq('id', businessId)
    if (updateError) {
      console.error('[YouTube Disconnect] Database update failed:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'YouTube disconnected successfully' })
  } catch (error) {
    console.error('[YouTube Disconnect]', error)
    return NextResponse.json(
      { error: 'Disconnect failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
