import { createClient } from '@supabase/supabase-js'
import { refreshTikTokToken, tiktokTokenColumns } from '@/lib/social/tiktok/tiktokOAuth'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'
const REFRESH_MARGIN_MS = 5 * 60 * 1000

type TikTokTokenRow = {
  tiktok_open_id: string | null
  tiktok_access_token: string | null
  tiktok_refresh_token: string | null
  tiktok_token_expires_at: string | null
}

/** True when the access token is missing an expiry or expires within the margin. */
export function tiktokTokenNeedsRefresh(expiresAt: string | null, now = Date.now()): boolean {
  if (!expiresAt) return true
  const t = new Date(expiresAt).getTime()
  return !Number.isFinite(t) || now >= t - REFRESH_MARGIN_MS
}

/**
 * Valid TikTok access token for a business, refreshing (and persisting the
 * rotated refresh token) when it is about to expire. Mirrors getGmbAccessToken.
 */
export async function getTikTokAccessToken(businessId: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data, error } = await supabase
    .from('businesses')
    .select('tiktok_open_id, tiktok_access_token, tiktok_refresh_token, tiktok_token_expires_at')
    .eq('id', businessId)
    .single()

  const business = data as TikTokTokenRow | null
  if (error || !business?.tiktok_open_id || !business.tiktok_access_token) return null
  if (DEMO) return business.tiktok_access_token
  if (!tiktokTokenNeedsRefresh(business.tiktok_token_expires_at)) return business.tiktok_access_token
  if (!business.tiktok_refresh_token) return business.tiktok_access_token

  try {
    const refreshed = await refreshTikTokToken(business.tiktok_refresh_token)
    const { error: updateError } = await supabase
      .from('businesses')
      .update(tiktokTokenColumns(refreshed))
      .eq('id', businessId)
    if (updateError) console.error('[TikTok] Saving refreshed token failed:', updateError)
    return refreshed.access_token
  } catch (err) {
    console.error('[TikTok] Token refresh failed:', err)
    throw new Error('TikTok connection expired - reconnect TikTok in Connections')
  }
}
