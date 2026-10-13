const MESSAGES: Record<string, string> = {
  cancelled: 'Pinterest connection was cancelled.',
  pinterest_not_enabled: 'Pinterest connect is not live yet - the Pinterest app is still in review.',
  invalid_state: 'That Pinterest connection link expired. Please try again.',
  missing_permissions: 'Please allow Vendl to read your boards and create Pins when connecting.',
  server_error: 'Something went wrong connecting Pinterest. Please try again.',
}

export function pinterestConnectErrorMessage(code: string): string {
  return MESSAGES[code] ?? `Pinterest connection failed (${code}).`
}
