import type { SupabaseClient } from '@supabase/supabase-js'
import type { GmbPendingLocation } from '@/lib/social/gmbConnectPendingCache'

export interface GmbConnectionTokens {
  accessToken: string
  refreshToken: string | null
  tokenExpiresAt: string | null
}

export async function completeGmbLocationConnection(
  db: SupabaseClient,
  businessId: string,
  accountId: string,
  location: GmbPendingLocation,
  tokens: GmbConnectionTokens,
): Promise<{ ok: true } | { ok: false; error: 'location_not_found' }> {
  const { error } = await db.from('businesses').update({
    gmb_account_id:        accountId,
    gmb_location_id:       location.locationId,
    gmb_location_name:     location.title,
    gmb_access_token:      tokens.accessToken,
    gmb_refresh_token:     tokens.refreshToken,
    gmb_token_expires_at:  tokens.tokenExpiresAt,
  }).eq('id', businessId)

  if (error) throw error
  return { ok: true }
}

export function getDemoGmbPendingSession(): {
  accountId: string
  accountName: string
  locations: GmbPendingLocation[]
  tokens: GmbConnectionTokens
} {
  return {
    accountId:   'demo-gmb-account',
    accountName: 'Demo Tradie Services',
    locations:   [
      {
        locationResourceName: 'accounts/demo-gmb-account/locations/demo-loc-parramatta',
        locationId:           'demo-loc-parramatta',
        title:                'Demo Electrical - Parramatta',
      },
      {
        locationResourceName: 'accounts/demo-gmb-account/locations/demo-loc-penrith',
        locationId:           'demo-loc-penrith',
        title:                'Demo Electrical - Penrith',
      },
    ],
    tokens: {
      accessToken:    'demo-gmb-access-token',
      refreshToken:   'demo-gmb-refresh-token',
      tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    },
  }
}
