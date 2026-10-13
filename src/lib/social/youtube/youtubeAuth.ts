import { createClient } from '@supabase/supabase-js'
import { refreshYouTubeToken, youtubeTokenColumns } from '@/lib/social/youtube/youtubeOAuth'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'
const REFRESH_MARGIN_MS = 5 * 60 * 1000

type YouTubeTokenRow = {
  youtube_channel_id: string | null
  youtube_access_token: string | null
  youtube_refresh_token: string | null
  youtube_token_expires_at: string | null
}

/** True when the access token is missing an expiry or expires within the margin. */
export function youtubeTokenNeedsRefresh(expiresAt: string | null, now = Date.now()): boolean {
  if (!expiresAt) return true
  const t = new Date(expiresAt).getTime()
  return !Number.isFinite(t) || now >= t - REFRESH_MARGIN_MS
}

/** Valid YouTube access token for a business, refreshing when it is about to expire. */
export async function getYouTubeAccessToken(businessId: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data, error } = await supabase
    .from('businesses')
    .select('youtube_channel_id, youtube_access_token, youtube_refresh_token, youtube_token_expires_at')
    .eq('id', businessId)
    .single()

  const business = data as YouTubeTokenRow | null
  if (error || !business?.youtube_channel_id || !business.youtube_access_token) return null
  if (DEMO) return business.youtube_access_token
  if (!youtubeTokenNeedsRefresh(business.youtube_token_expires_at)) return business.youtube_access_token
  if (!business.youtube_refresh_token) {
    throw new Error('YouTube connection expired - reconnect YouTube in Connections')
  }

  try {
    const refreshed = await refreshYouTubeToken(business.youtube_refresh_token)
    const { error: updateError } = await supabase
      .from('businesses')
      .update(youtubeTokenColumns(refreshed))
      .eq('id', businessId)
    if (updateError) console.error('[YouTube] Saving refreshed token failed:', updateError)
    return refreshed.access_token
  } catch (err) {
    console.error('[YouTube] Token refresh failed:', err)
    throw new Error('YouTube connection expired - reconnect YouTube in Connections')
  }
}
