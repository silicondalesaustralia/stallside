import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'
import { createGmbOAuth2Client } from '@/lib/social/gmbOAuthCredentials'

export async function POST(_request: NextRequest) {
  try {
    const ctx = await requireSocialConnectionManage()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    const { data: business } = await db
      .from('businesses')
      .select('gmb_access_token, gmb_refresh_token')
      .eq('id', businessId)
      .single()

    if (business?.gmb_access_token) {
      try {
        const oauth2Client = createGmbOAuth2Client()
        oauth2Client.setCredentials({
          access_token: business.gmb_access_token,
        })
        await oauth2Client.revokeCredentials()
      } catch (revokeError) {
        console.error('[GMB Disconnect] Token revocation failed:', revokeError)
      }
    }

    const { error: updateError } = await db
      .from('businesses')
      .update({
        gmb_account_id:       null,
        gmb_location_id:      null,
        gmb_location_name:    null,
        gmb_access_token:     null,
        gmb_refresh_token:    null,
        gmb_token_expires_at: null,
      })
      .eq('id', businessId)

    if (updateError) {
      console.error('[GMB Disconnect] Database update failed:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Google Business Profile disconnected successfully',
    })
  } catch (error) {
    console.error('[GMB Disconnect]', error)
    return NextResponse.json(
      { error: 'Disconnect failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
