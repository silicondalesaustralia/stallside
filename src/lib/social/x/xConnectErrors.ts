const MESSAGES: Record<string, string> = {
  cancelled: 'X connection was cancelled.',
  access_denied: 'X connection was cancelled.',
  x_not_enabled: 'X connect is not switched on yet.',
  invalid_state: 'That X connection link expired. Please try again.',
  missing_permissions: 'Please allow Vendl to post and upload media to your X account when connecting.',
  server_error: 'Something went wrong connecting X. Please try again.',
}

export function xConnectErrorMessage(code: string): string {
  return MESSAGES[code] ?? `X connection failed (${code}).`
}
