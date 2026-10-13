import { socialDb } from '@/lib/socialHost/socialDb'
import { pinterestTokenColumns, refreshPinterestToken } from '@/lib/social/pinterest/pinterestOAuth'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'
const REFRESH_MARGIN_MS = 24 * 60 * 60 * 1000

type PinterestTokenRow = {
  pinterest_user_id: string | null
  pinterest_access_token: string | null
  pinterest_refresh_token: string | null
  pinterest_token_expires_at: string | null
}

/** True when the access token has no expiry or expires within a day. */
export function pinterestTokenNeedsRefresh(expiresAt: string | null, now = Date.now()): boolean {
  if (!expiresAt) return true
  const t = new Date(expiresAt).getTime()
  return !Number.isFinite(t) || now >= t - REFRESH_MARGIN_MS
}

/** Valid Pinterest access token for a business, refreshing when it is about to expire. */
export async function getPinterestAccessToken(businessId: string): Promise<string | null> {
  const db = socialDb()
  const { data, error } = await db
    .from('businesses')
    .select('pinterest_user_id, pinterest_access_token, pinterest_refresh_token, pinterest_token_expires_at')
    .eq('id', businessId)
    .single()

  const business = data as PinterestTokenRow | null
  if (error || !business?.pinterest_user_id || !business.pinterest_access_token) return null
  if (DEMO) return business.pinterest_access_token
  if (!pinterestTokenNeedsRefresh(business.pinterest_token_expires_at)) return business.pinterest_access_token
  if (!business.pinterest_refresh_token) {
    throw new Error('Pinterest connection expired - reconnect Pinterest in Connectors')
  }

  try {
    const refreshed = await refreshPinterestToken(business.pinterest_refresh_token)
    const { error: updateError } = await db
      .from('businesses')
      .update(pinterestTokenColumns(refreshed))
      .eq('id', businessId)
    if (updateError) console.error('[Pinterest] Saving refreshed token failed:', updateError)
    return refreshed.access_token
  } catch (err) {
    console.error('[Pinterest] Token refresh failed:', err)
    throw new Error('Pinterest connection expired - reconnect Pinterest in Connectors')
  }
}
