export type MetaConnectErrorCode =
  | 'instagram_requires_facebook'
  | 'no_instagram_linked'
  | 'no_pages_found'
  | 'cancelled'
  | 'access_denied'
  | 'server_error'
  | 'meta_not_enabled'
  | 'invalid_session'
  | 'page_not_found'

export interface MetaConnectErrorInfo {
  title: string
  message: string
  guideSection?: 'before' | 'create-page' | 'setup-instagram' | 'during-login' | 'troubleshoot-no-pages' | 'troubleshoot-no-ig' | 'troubleshoot-business-suite'
}

export function normalizeMetaErrorCode(raw: string | null): MetaConnectErrorCode | null {
  if (!raw) return null
  if (raw === 'access_denied') return 'cancelled'
  if (raw === 'user_denied') return 'cancelled'
  return raw as MetaConnectErrorCode
}

export function getMetaConnectErrorInfo(code: MetaConnectErrorCode): MetaConnectErrorInfo {
  switch (code) {
    case 'instagram_requires_facebook':
      return {
        title: 'Connect Facebook first',
        message:
          'Instagram auto-posting uses your Facebook Page connection. Connect Facebook, link Instagram to that Page in Meta, then connect Instagram here.',
        guideSection: 'setup-instagram',
      }
    case 'no_instagram_linked':
      return {
        title: 'No Instagram linked to this Page',
        message:
          'We found your Facebook Page but no Instagram Business or Creator account linked to it. Link Instagram in Meta, then try again.',
        guideSection: 'troubleshoot-no-ig',
      }
    case 'no_pages_found':
      return {
        title: 'No Facebook Page found',
        message:
          'Meta did not return any Pages for this login. Create a Page first, make sure you are an admin, and opt in to all Pages during login.',
        guideSection: 'troubleshoot-no-pages',
      }
    case 'cancelled':
    case 'access_denied':
      return {
        title: 'Connection cancelled',
        message: 'You cancelled Meta login or did not grant the requested permissions. You can try again when ready.',
        guideSection: 'during-login',
      }
    case 'server_error':
      return {
        title: 'Something went wrong connecting to Meta',
        message:
          'StitchedUp could not finish the Meta connection. Check your Page setup and try again. If your Page is managed in Meta Business Suite, grant all businesses during login.',
        guideSection: 'troubleshoot-business-suite',
      }
    case 'meta_not_enabled':
      return {
        title: 'Meta connect not live yet',
        message:
          'Facebook and Instagram auto-posting will open after Meta App Review is approved. You can still create posts and publish manually from the Social tab.',
      }
    case 'invalid_session':
      return {
        title: 'Connection session expired',
        message: 'Your Page selection session expired. Please start the connect flow again.',
      }
    case 'page_not_found':
      return {
        title: 'Page not available',
        message: 'The selected Page is no longer available for this connection. Try again and pick a different Page.',
      }
    default:
      return {
        title: 'Connection problem',
        message: 'Something went wrong. Please try connecting again.',
        guideSection: 'before',
      }
  }
}
