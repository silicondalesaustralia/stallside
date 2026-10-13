'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { xConnectErrorMessage } from '@/lib/social/x/xConnectErrors'

type XConnectConfig = {
  xConnectEnabled: boolean
  socialDemoMode: boolean
  canUseXConnectDemo: boolean
}

export function useXConnect({
  integrationsPath,
  onConnected,
}: {
  integrationsPath: string
  onConnected: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [config, setConfig] = useState<XConnectConfig | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/social/connect/x/config')
        if (!res.ok) throw new Error(`Config failed (${res.status})`)
        setConfig((await res.json()) as XConnectConfig)
      } catch (err) {
        console.error('[X connect] Config load failed', err)
        setConfig({ xConnectEnabled: false, socialDemoMode: false, canUseXConnectDemo: false })
      }
    }
    void loadConfig()
  }, [])

  useEffect(() => {
    const error = searchParams.get('x_error')
    const connected = searchParams.get('x_connected')
    if (!error && !connected) return
    if (error) toast(xConnectErrorMessage(error), 'error')
    if (connected) {
      toast('X connected', 'success')
      onConnected()
    }
    router.replace(integrationsPath, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const canConnect = Boolean(config?.xConnectEnabled || config?.canUseXConnectDemo)

  const beginConnect = useCallback(() => {
    const returnQuery = encodeURIComponent(integrationsPath)
    if (config?.xConnectEnabled) {
      window.location.href = `/api/social/connect/x?returnPath=${returnQuery}`
    } else if (config?.canUseXConnectDemo) {
      window.location.href = `/api/social/connect/x/demo?returnPath=${returnQuery}`
    } else {
      toast(xConnectErrorMessage('x_not_enabled'), 'error')
    }
  }, [config, integrationsPath, toast])

  const disconnect = useCallback(async () => {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/social/connect/x/disconnect', { method: 'POST' })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || 'Failed to disconnect')
      }
      toast('X disconnected', 'success')
      onConnected()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to disconnect', 'error')
    } finally {
      setDisconnecting(false)
    }
  }, [onConnected, toast])

  return {
    canConnect,
    showDemoHint: Boolean(config?.canUseXConnectDemo),
    beginConnect,
    disconnect,
    disconnecting,
  }
}
