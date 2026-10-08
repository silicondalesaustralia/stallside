import { createClient } from '@supabase/supabase-js'
import { createGmbOAuth2Client } from '@/lib/social/gmbOAuthCredentials'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

/**
 * Returns a valid GMB access token for a business, refreshing if expired.
 * Mirrors the refresh pattern in lib/googleCalendar.ts.
 */
export async function getGmbAccessToken(businessId: string): Promise<string | null> {
  if (DEMO) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: business } = await supabase
      .from('businesses')
      .select('gmb_access_token, gmb_account_id')
      .eq('id', businessId)
      .single()

    if (!business?.gmb_account_id) return null
    return business.gmb_access_token || 'demo-gmb-access-token'
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: business, error } = await supabase
    .from('businesses')
    .select('gmb_access_token, gmb_refresh_token, gmb_token_expires_at, gmb_account_id')
    .eq('id', businessId)
    .single()

  if (error || !business?.gmb_account_id) {
    return null
  }

  if (!business.gmb_access_token) {
    return null
  }

  if (!business.gmb_refresh_token) {
    return business.gmb_access_token
  }

  const oauth2Client = createGmbOAuth2Client()

  oauth2Client.setCredentials({
    access_token:  business.gmb_access_token,
    refresh_token: business.gmb_refresh_token,
    expiry_date:   business.gmb_token_expires_at
      ? new Date(business.gmb_token_expires_at).getTime()
      : undefined,
  })

  const now = Date.now()
  const expiresAt = business.gmb_token_expires_at
    ? new Date(business.gmb_token_expires_at).getTime()
    : 0

  const shouldRefresh = !expiresAt || now >= expiresAt - 5 * 60 * 1000

  if (!shouldRefresh) {
    return business.gmb_access_token
  }

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()
    oauth2Client.setCredentials(credentials)

    await supabase
      .from('businesses')
      .update({
        gmb_access_token:     credentials.access_token ?? business.gmb_access_token,
        gmb_token_expires_at: credentials.expiry_date
          ? new Date(credentials.expiry_date).toISOString()
          : null,
        ...(credentials.refresh_token
          ? { gmb_refresh_token: credentials.refresh_token }
          : {}),
      })
      .eq('id', businessId)

    return credentials.access_token ?? business.gmb_access_token
  } catch (refreshError) {
    console.error('[GMB] Token refresh failed:', refreshError)
    throw new Error('Failed to refresh Google Business Profile token')
  }
}

/** Parse OAuth token response from raw fetch (expires_in seconds). */
export function gmbTokenExpiresAtFromOAuthResponse(tokens: {
  expires_in?: number
  expiry_date?: number
}): string | null {
  if (tokens.expiry_date) {
    return new Date(tokens.expiry_date).toISOString()
  }
  if (tokens.expires_in) {
    return new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  }
  return null
}
