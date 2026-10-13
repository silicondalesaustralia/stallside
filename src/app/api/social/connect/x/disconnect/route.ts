import { NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { revokeXToken } from '@/lib/social/x/xOAuth'

const CLEARED = {
  x_user_id: null,
  x_username: null,
  x_profile_image_url: null,
  x_access_token: null,
  x_refresh_token: null,
  x_token_expires_at: null,
  x_scopes: null,
}

export async function POST() {
  try {
    const ctx = await requireSocialConnectionManage()
    if (!ctx.ok) return ctx.response

    const { data } = await ctx.db.from('businesses').select('x_access_token').eq('id', ctx.businessId).single()
    const token = (data as { x_access_token?: string | null } | null)?.x_access_token
    if (token && process.env.SOCIAL_DEMO_MODE !== 'true') {
      try {
        await revokeXToken(token)
      } catch (err) {
        console.error('[X Disconnect] Revoke failed (continuing):', err)
      }
    }

    const { error: updateError } = await ctx.db.from('businesses').update(CLEARED).eq('id', ctx.businessId)
    if (updateError) {
      console.error('[X Disconnect] Database update failed:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'X disconnected successfully' })
  } catch (error) {
    console.error('[X Disconnect]', error)
    return NextResponse.json(
      { error: 'Disconnect failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
