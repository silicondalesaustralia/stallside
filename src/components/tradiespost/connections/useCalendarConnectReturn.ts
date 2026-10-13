'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

const ERRORS: Record<string, string> = {
  cancelled: 'Google Calendar connection was cancelled.',
  not_enabled: 'Google Calendar connect is not live yet.',
  invalid_state: 'That connection link expired. Please try again.',
  missing_permissions: 'Please allow both calendar permissions when connecting.',
  server_error: 'Something went wrong connecting Google Calendar. Please try again.',
}

/** Toasts the ?calendar_connected / ?calendar_error result of the Google consent round-trip. */
export function useCalendarConnectReturn(integrationsPath: string, onConnected: () => void) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const error = searchParams.get('calendar_error')
    const connected = searchParams.get('calendar_connected')
    if (!error && !connected) return
    if (error) toast(ERRORS[error] ?? `Google Calendar connection failed (${error}).`, 'error')
    if (connected) {
      toast('Google Calendar connected - syncing now', 'success')
      onConnected()
    }
    router.replace(integrationsPath, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
}
