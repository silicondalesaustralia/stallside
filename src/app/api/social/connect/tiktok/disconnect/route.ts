import { NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { revokeTikTokToken } from '@/lib/social/tiktok/tiktokOAuth'
import { isTikTokConnectEnabled } from '@/lib/social/tiktok/tiktokConfig'

const CLEARED = {
  tiktok_open_id: null,
  tiktok_display_name: null,
  tiktok_avatar_url: null,
  tiktok_access_token: null,
  tiktok_refresh_token: null,
  tiktok_token_expires_at: null,
  tiktok_refresh_expires_at: null,
  tiktok_scopes: null,
}

export async function POST() {
  try {
    const ctx = await requireSocialConnectionManage()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    const { data: biz } = await db
      .from('businesses')
      .select('tiktok_access_token')
      .eq('id', businessId)
      .single()

    const token = (biz as { tiktok_access_token?: string | null } | null)?.tiktok_access_token
    if (token && isTikTokConnectEnabled()) {
      try {
        await revokeTikTokToken(token)
      } catch (err) {
        console.warn('[TikTok Disconnect] Revoke failed (clearing locally anyway):', err)
      }
    }

    const { error: updateError } = await db.from('businesses').update(CLEARED).eq('id', businessId)
    if (updateError) {
      console.error('[TikTok Disconnect] Database update failed:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'TikTok disconnected successfully' })
  } catch (error) {
    console.error('[TikTok Disconnect]', error)
    return NextResponse.json(
      { error: 'Disconnect failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
