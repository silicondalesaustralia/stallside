import { NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'

/** Pinterest v5 has no token-revoke endpoint; the seller can remove the app from their Pinterest settings. */
const CLEARED = {
  pinterest_user_id: null,
  pinterest_username: null,
  pinterest_profile_image_url: null,
  pinterest_access_token: null,
  pinterest_refresh_token: null,
  pinterest_token_expires_at: null,
  pinterest_scopes: null,
}

export async function POST() {
  try {
    const ctx = await requireSocialConnectionManage()
    if (!ctx.ok) return ctx.response
    const { error: updateError } = await ctx.db.from('businesses').update(CLEARED).eq('id', ctx.businessId)
    if (updateError) {
      console.error('[Pinterest Disconnect] Database update failed:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Pinterest disconnected successfully' })
  } catch (error) {
    console.error('[Pinterest Disconnect]', error)
    return NextResponse.json(
      { error: 'Disconnect failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
