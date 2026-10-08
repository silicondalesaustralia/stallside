import { NextRequest, NextResponse } from 'next/server'
import { requireSocialConnectionManage } from '@/lib/products/requireTradiesPostConnectionManage'

type MetaDisconnectPlatform = 'facebook' | 'instagram'

function parsePlatform(body: unknown): MetaDisconnectPlatform | null {
  if (!body || typeof body !== 'object') return null
  const platform = (body as { platform?: unknown }).platform
  if (platform === 'facebook' || platform === 'instagram') return platform
  return null
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireSocialConnectionManage()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const platform = parsePlatform(body)
    if (!platform) {
      return NextResponse.json(
        { error: 'platform must be facebook or instagram' },
        { status: 400 },
      )
    }

    const update =
      platform === 'facebook'
        ? {
            facebook_page_id: null,
            facebook_page_name: null,
            facebook_access_token: null,
            // Instagram publish uses the same Page token - clear it too.
            instagram_account_id: null,
            instagram_username: null,
          }
        : {
            instagram_account_id: null,
            instagram_username: null,
          }

    const { error: updateError } = await db
      .from('businesses')
      .update(update)
      .eq('id', businessId)

    if (updateError) {
      console.error('[Meta Disconnect] Database update failed:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      platform,
      message:
        platform === 'facebook'
          ? 'Facebook Page disconnected successfully'
          : 'Instagram disconnected successfully',
    })
  } catch (error) {
    console.error('[Meta Disconnect]', error)
    return NextResponse.json(
      {
        error: 'Disconnect failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
