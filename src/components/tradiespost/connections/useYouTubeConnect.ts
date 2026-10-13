'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { youtubeConnectErrorMessage } from '@/lib/social/youtube/youtubeConnectErrors'

type YouTubeConnectConfig = {
  youtubeConnectEnabled: boolean
  socialDemoMode: boolean
  canUseYouTubeConnectDemo: boolean
}

export function useYouTubeConnect({
  integrationsPath,
  onConnected,
}: {
  integrationsPath: string
  onConnected: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [config, setConfig] = useState<YouTubeConnectConfig | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/social/connect/youtube/config')
        if (!res.ok) throw new Error(`Config failed (${res.status})`)
        setConfig((await res.json()) as YouTubeConnectConfig)
      } catch (err) {
        console.error('[YouTube connect] Config load failed', err)
        setConfig({ youtubeConnectEnabled: false, socialDemoMode: false, canUseYouTubeConnectDemo: false })
      }
    }
    void loadConfig()
  }, [])

  useEffect(() => {
    const error = searchParams.get('youtube_error')
    const connected = searchParams.get('youtube_connected')
    if (!error && !connected) return
    if (error) toast(youtubeConnectErrorMessage(error), 'error')
    if (connected) {
      toast('YouTube connected', 'success')
      onConnected()
    }
    router.replace(integrationsPath, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const canConnect = Boolean(config?.youtubeConnectEnabled || config?.canUseYouTubeConnectDemo)

  const beginConnect = useCallback(() => {
    const returnQuery = encodeURIComponent(integrationsPath)
    if (config?.youtubeConnectEnabled) {
      window.location.href = `/api/social/connect/youtube?returnPath=${returnQuery}`
    } else if (config?.canUseYouTubeConnectDemo) {
      window.location.href = `/api/social/connect/youtube/demo?returnPath=${returnQuery}`
    } else {
      toast(youtubeConnectErrorMessage('youtube_not_enabled'), 'error')
    }
  }, [config, integrationsPath, toast])

  const disconnect = useCallback(async () => {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/social/connect/youtube/disconnect', { method: 'POST' })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || 'Failed to disconnect')
      }
      toast('YouTube disconnected', 'success')
      onConnected()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to disconnect', 'error')
    } finally {
      setDisconnecting(false)
    }
  }, [onConnected, toast])

  return {
    canConnect,
    showDemoHint: Boolean(config?.canUseYouTubeConnectDemo),
    beginConnect,
    disconnect,
    disconnecting,
  }
}
