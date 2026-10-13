import { socialDb } from '@/lib/socialHost/socialDb'
import { refreshXToken, xTokenColumns } from '@/lib/social/x/xOAuth'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'
const REFRESH_MARGIN_MS = 5 * 60 * 1000

type XTokenRow = {
  x_user_id: string | null
  x_access_token: string | null
  x_refresh_token: string | null
  x_token_expires_at: string | null
}

/** True when the access token has no expiry or expires within five minutes (X tokens last ~2 hours). */
export function xTokenNeedsRefresh(expiresAt: string | null, now = Date.now()): boolean {
  if (!expiresAt) return true
  const t = new Date(expiresAt).getTime()
  return !Number.isFinite(t) || now >= t - REFRESH_MARGIN_MS
}

/** Valid X access token for a business, refreshing (and saving the rotated refresh token) when needed. */
export async function getXAccessToken(businessId: string): Promise<string | null> {
  const db = socialDb()
  const { data, error } = await db
    .from('businesses')
    .select('x_user_id, x_access_token, x_refresh_token, x_token_expires_at')
    .eq('id', businessId)
    .single()

  const business = data as XTokenRow | null
  if (error || !business?.x_user_id || !business.x_access_token) return null
  if (DEMO) return business.x_access_token
  if (!xTokenNeedsRefresh(business.x_token_expires_at)) return business.x_access_token
  if (!business.x_refresh_token) {
    throw new Error('X connection expired - reconnect X in Connectors')
  }

  try {
    const refreshed = await refreshXToken(business.x_refresh_token)
    const { error: updateError } = await db.from('businesses').update(xTokenColumns(refreshed)).eq('id', businessId)
    if (updateError) console.error('[X] Saving refreshed token failed:', updateError)
    return refreshed.access_token
  } catch (err) {
    console.error('[X] Token refresh failed:', err)
    throw new Error('X connection expired - reconnect X in Connectors')
  }
}
