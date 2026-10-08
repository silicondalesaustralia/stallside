'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { tiktokConnectErrorMessage } from '@/lib/social/tiktok/tiktokConnectErrors'

type TikTokConnectConfig = {
  tiktokConnectEnabled: boolean
  socialDemoMode: boolean
  canUseTikTokConnectDemo: boolean
}

export function useTikTokConnect({
  integrationsPath,
  onConnected,
}: {
  integrationsPath: string
  onConnected: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [config, setConfig] = useState<TikTokConnectConfig | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/social/connect/tiktok/config')
        if (!res.ok) throw new Error(`Config failed (${res.status})`)
        setConfig((await res.json()) as TikTokConnectConfig)
      } catch (err) {
        console.error('[TikTok connect] Config load failed', err)
        setConfig({ tiktokConnectEnabled: false, socialDemoMode: false, canUseTikTokConnectDemo: false })
      }
    }
    void loadConfig()
  }, [])

  useEffect(() => {
    const error = searchParams.get('tiktok_error')
    const connected = searchParams.get('tiktok_connected')
    if (!error && !connected) return
    if (error) toast(tiktokConnectErrorMessage(error), 'error')
    if (connected) {
      toast('TikTok connected', 'success')
      onConnected()
    }
    router.replace(integrationsPath, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const canConnect = Boolean(config?.tiktokConnectEnabled || config?.canUseTikTokConnectDemo)

  const beginConnect = useCallback(() => {
    const returnQuery = encodeURIComponent(integrationsPath)
    if (config?.tiktokConnectEnabled) {
      window.location.href = `/api/social/connect/tiktok?returnPath=${returnQuery}`
    } else if (config?.canUseTikTokConnectDemo) {
      window.location.href = `/api/social/connect/tiktok/demo?returnPath=${returnQuery}`
    } else {
      toast(tiktokConnectErrorMessage('tiktok_not_enabled'), 'error')
    }
  }, [config, integrationsPath, toast])

  const disconnect = useCallback(async () => {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/social/connect/tiktok/disconnect', { method: 'POST' })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || 'Failed to disconnect')
      }
      toast('TikTok disconnected', 'success')
      onConnected()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to disconnect', 'error')
    } finally {
      setDisconnecting(false)
    }
  }, [onConnected, toast])

  return {
    canConnect,
    showDemoHint: Boolean(config?.canUseTikTokConnectDemo),
    beginConnect,
    disconnect,
    disconnecting,
  }
}
