const MESSAGES: Record<string, string> = {
  cancelled: 'TikTok connection was cancelled.',
  tiktok_not_enabled: 'TikTok connect is not live yet - the TikTok app is still in review.',
  invalid_state: 'That TikTok connection link expired. Please try again.',
  missing_permissions: 'Please allow TikTok posting permissions when connecting.',
  server_error: 'Something went wrong connecting TikTok. Please try again.',
}

export function tiktokConnectErrorMessage(code: string): string {
  return MESSAGES[code] ?? `TikTok connection failed (${code}).`
}
