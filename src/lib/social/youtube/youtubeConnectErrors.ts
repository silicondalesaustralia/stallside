const MESSAGES: Record<string, string> = {
  cancelled: 'YouTube connection was cancelled.',
  youtube_not_enabled: 'YouTube connect is not live yet - the Google app is still in review.',
  invalid_state: 'That YouTube connection link expired. Please try again.',
  missing_permissions: 'Please allow YouTube upload permissions when connecting.',
  no_channel: 'That Google account has no YouTube channel. Create a channel on YouTube, then try again.',
  server_error: 'Something went wrong connecting YouTube. Please try again.',
}

export function youtubeConnectErrorMessage(code: string): string {
  return MESSAGES[code] ?? `YouTube connection failed (${code}).`
}
