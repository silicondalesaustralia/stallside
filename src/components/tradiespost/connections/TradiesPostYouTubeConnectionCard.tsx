'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  TradiesPostConnectionPrimaryButton,
  TradiesPostConnectionSecondaryButton,
  TradiesPostProviderConnectionCard,
} from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'
import { YouTubeBrandIcon } from '@/components/tradiespost/connections/TradiesPostSocialBrandIcons'
import { useYouTubeConnect } from '@/components/tradiespost/connections/useYouTubeConnect'

type Props = {
  youtubeChannelId?: string | null
  youtubeChannelTitle?: string | null
  onConnected: () => void
  integrationsPath: string
  canManageConnections?: boolean
}

export function TradiesPostYouTubeConnectionCard({
  youtubeChannelId,
  youtubeChannelTitle,
  onConnected,
  integrationsPath,
  canManageConnections = true,
}: Props) {
  const connected = Boolean(youtubeChannelId)
  const { canConnect, showDemoHint, beginConnect, disconnect, disconnecting } =
    useYouTubeConnect({ integrationsPath, onConnected })
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  async function confirmDisconnect() {
    await disconnect()
    setShowDisconnectModal(false)
  }

  return (
    <>
      <TradiesPostProviderConnectionCard
        testId="tp-connection-youtube"
        name="YouTube"
        benefit="Share product videos and Shorts on your YouTube channel."
        icon={<YouTubeBrandIcon />}
        status={connected ? 'connected' : 'not_connected'}
        connected={connected}
        connectedDetail={youtubeChannelTitle ? `Posting as ${youtubeChannelTitle}` : 'Channel connected'}
        statusBlock={
          showDemoHint && !connected ? (
            <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              <strong>Demo mode:</strong> YouTube connect is simulated for testing.
            </p>
          ) : null
        }
        primaryAction={
          !connected && canManageConnections ? (
            <TradiesPostConnectionPrimaryButton onClick={beginConnect}>
              Connect YouTube
            </TradiesPostConnectionPrimaryButton>
          ) : null
        }
        secondaryAction={
          connected && canManageConnections ? (
            <div className="flex flex-wrap items-center gap-3">
              {canConnect && (
                <TradiesPostConnectionSecondaryButton onClick={beginConnect}>
                  Reconnect
                </TradiesPostConnectionSecondaryButton>
              )}
              <button
                type="button"
                disabled={disconnecting}
                onClick={() => setShowDisconnectModal(true)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          ) : null
        }
      />

      <Modal open={showDisconnectModal} onClose={() => setShowDisconnectModal(false)} title="Disconnect YouTube?">
        <p className="mb-6 text-sm text-zinc-600">
          Vendl will stop posting to this YouTube channel. Scheduled YouTube posts will fail until you reconnect.
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setShowDisconnectModal(false)} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={() => void confirmDisconnect()}
            disabled={disconnecting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {disconnecting ? 'Disconnecting…' : 'Disconnect'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
