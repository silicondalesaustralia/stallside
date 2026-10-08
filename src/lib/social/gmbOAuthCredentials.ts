import { google } from 'googleapis'
import { gmbOAuthRedirectUri } from '@/lib/social/gmbConnectConfig'

/** Dedicated GMB OAuth client - separate from Calendar (GOOGLE_CLIENT_ID). */
export function getGmbOAuthClientId(): string | undefined {
  return process.env.GOOGLE_GMB_CLIENT_ID
}

export function getGmbOAuthClientSecret(): string | undefined {
  return process.env.GOOGLE_GMB_CLIENT_SECRET
}

export function requireGmbOAuthCredentials(): { clientId: string; clientSecret: string } {
  const clientId = getGmbOAuthClientId()
  const clientSecret = getGmbOAuthClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_GMB_CLIENT_ID and GOOGLE_GMB_CLIENT_SECRET must be configured')
  }
  return { clientId, clientSecret }
}

export function createGmbOAuth2Client() {
  const { clientId, clientSecret } = requireGmbOAuthCredentials()
  return new google.auth.OAuth2(clientId, clientSecret, gmbOAuthRedirectUri())
}
