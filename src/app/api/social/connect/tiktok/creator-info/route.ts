import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'
import { getTikTokAccessToken } from '@/lib/social/tiktok/tiktokAuth'
import {
  DEMO_TIKTOK_CREATOR_INFO,
  queryTikTokCreatorInfo,
} from '@/lib/social/tiktok/tiktokCreatorInfo'
import { TikTokApiError } from '@/lib/social/tiktok/tiktokApi'

/** Fresh creator info for the composer (privacy options, interaction limits, max duration). */
export async function GET() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response

  try {
    const token = await getTikTokAccessToken(ctx.businessId)
    if (!token) return NextResponse.json({ error: 'TikTok is not connected' }, { status: 404 })
    if (isSocialDemoMode()) return NextResponse.json({ creator: DEMO_TIKTOK_CREATOR_INFO })

    const creator = await queryTikTokCreatorInfo(token)
    return NextResponse.json({ creator })
  } catch (err) {
    console.error('[TikTok creator-info]', err)
    if (err instanceof TikTokApiError && err.code === 'spam_risk_too_many_posts') {
      return NextResponse.json(
        { error: 'This TikTok account has hit its daily post limit. Try again tomorrow.' },
        { status: 429 },
      )
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not load TikTok account details' },
      { status: 502 },
    )
  }
}
