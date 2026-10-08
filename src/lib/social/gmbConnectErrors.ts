export type GmbConnectErrorCode =
  | 'no_accounts_found'
  | 'no_locations_found'
  | 'cancelled'
  | 'access_denied'
  | 'server_error'
  | 'gmb_not_enabled'
  | 'invalid_session'
  | 'location_not_found'

export type GmbGuideSection =
  | 'before'
  | 'create-profile'
  | 'verify-profile'
  | 'during-login'
  | 'troubleshoot-no-locations'
  | 'troubleshoot-not-manager'

export interface GmbConnectErrorInfo {
  title: string
  message: string
  guideSection?: GmbGuideSection
}

export function normalizeGmbErrorCode(raw: string | null): GmbConnectErrorCode | null {
  if (!raw) return null
  if (raw === 'access_denied') return 'cancelled'
  if (raw === 'cancelled') return 'cancelled'
  return raw as GmbConnectErrorCode
}

export function getGmbConnectErrorInfo(code: GmbConnectErrorCode): GmbConnectErrorInfo {
  switch (code) {
    case 'no_accounts_found':
      return {
        title: 'No Google Business Profile found',
        message:
          'Google did not return any Business Profile accounts for this login. Create and verify a profile first, then try again with the Google account that manages it.',
        guideSection: 'create-profile',
      }
    case 'no_locations_found':
      return {
        title: 'No business locations found',
        message:
          'We found your Business Profile account but no locations. Add a location in Google Business Profile, or sign in with an account that is an owner or manager.',
        guideSection: 'troubleshoot-no-locations',
      }
    case 'cancelled':
    case 'access_denied':
      return {
        title: 'Connection cancelled',
        message:
          'You cancelled Google sign-in or did not grant StitchedUp permission to manage your Business Profile. Try again when ready.',
        guideSection: 'during-login',
      }
    case 'server_error':
      return {
        title: 'Something went wrong connecting to Google',
        message:
          'StitchedUp could not finish the Google Business connection. Check that your profile is verified and you used the owner/manager Google account.',
        guideSection: 'troubleshoot-not-manager',
      }
    case 'gmb_not_enabled':
      return {
        title: 'Google Business posting not live yet',
        message:
          'Auto-posting to Google Business Profile opens after Google approves our API access. You can still create posts for Instagram and Facebook from the Social tab.',
      }
    case 'invalid_session':
      return {
        title: 'Connection session expired',
        message: 'Your location selection session expired. Please start the connect flow again.',
      }
    case 'location_not_found':
      return {
        title: 'Location not available',
        message: 'The selected location is no longer available for this connection. Try again and pick a different location.',
      }
    default:
      return {
        title: 'Connection problem',
        message: 'Something went wrong. Please try connecting again.',
        guideSection: 'before',
      }
  }
}
