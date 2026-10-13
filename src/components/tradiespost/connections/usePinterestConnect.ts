'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { pinterestConnectErrorMessage } from '@/lib/social/pinterest/pinterestConnectErrors'

type PinterestConnectConfig = {
  pinterestConnectEnabled: boolean
  socialDemoMode: boolean
  canUsePinterestConnectDemo: boolean
}

export function usePinterestConnect({
  integrationsPath,
  onConnected,
}: {
  integrationsPath: string
  onConnected: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [config, setConfig] = useState<PinterestConnectConfig | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/social/connect/pinterest/config')
        if (!res.ok) throw new Error(`Config failed (${res.status})`)
        setConfig((await res.json()) as PinterestConnectConfig)
      } catch (err) {
        console.error('[Pinterest connect] Config load failed', err)
        setConfig({ pinterestConnectEnabled: false, socialDemoMode: false, canUsePinterestConnectDemo: false })
      }
    }
    void loadConfig()
  }, [])

  useEffect(() => {
    const error = searchParams.get('pinterest_error')
    const connected = searchParams.get('pinterest_connected')
    if (!error && !connected) return
    if (error) toast(pinterestConnectErrorMessage(error), 'error')
    if (connected) {
      toast('Pinterest connected', 'success')
      onConnected()
    }
    router.replace(integrationsPath, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const canConnect = Boolean(config?.pinterestConnectEnabled || config?.canUsePinterestConnectDemo)

  const beginConnect = useCallback(() => {
    const returnQuery = encodeURIComponent(integrationsPath)
    if (config?.pinterestConnectEnabled) {
      window.location.href = `/api/social/connect/pinterest?returnPath=${returnQuery}`
    } else if (config?.canUsePinterestConnectDemo) {
      window.location.href = `/api/social/connect/pinterest/demo?returnPath=${returnQuery}`
    } else {
      toast(pinterestConnectErrorMessage('pinterest_not_enabled'), 'error')
    }
  }, [config, integrationsPath, toast])

  const disconnect = useCallback(async () => {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/social/connect/pinterest/disconnect', { method: 'POST' })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || 'Failed to disconnect')
      }
      toast('Pinterest disconnected', 'success')
      onConnected()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to disconnect', 'error')
    } finally {
      setDisconnecting(false)
    }
  }, [onConnected, toast])

  return {
    canConnect,
    showDemoHint: Boolean(config?.canUsePinterestConnectDemo),
    beginConnect,
    disconnect,
    disconnecting,
  }
}
