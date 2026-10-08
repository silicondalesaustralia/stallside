'use client'

import { useState } from 'react'
import { Music2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  TradiesPostConnectionPrimaryButton,
  TradiesPostConnectionSecondaryButton,
  TradiesPostProviderConnectionCard,
} from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'
import { useTikTokConnect } from '@/components/tradiespost/connections/useTikTokConnect'

type Props = {
  tiktokOpenId?: string | null
  tiktokDisplayName?: string | null
  onConnected: () => void
  integrationsPath: string
  canManageConnections?: boolean
}

export function TradiesPostTikTokConnectionCard({
  tiktokOpenId,
  tiktokDisplayName,
  onConnected,
  integrationsPath,
  canManageConnections = true,
}: Props) {
  const connected = Boolean(tiktokOpenId)
  const { canConnect, showDemoHint, beginConnect, disconnect, disconnecting } =
    useTikTokConnect({ integrationsPath, onConnected })
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  async function confirmDisconnect() {
    await disconnect()
    setShowDisconnectModal(false)
  }

  return (
    <>
      <TradiesPostProviderConnectionCard
        testId="tp-connection-tiktok"
        name="TikTok"
        benefit="Post job photos and videos straight to your TikTok account."
        icon={<Music2 className="h-6 w-6 text-[#18181B]" aria-hidden />}
        status={connected ? 'connected' : 'not_connected'}
        connected={connected}
        connectedDetail={tiktokDisplayName ? `Posting as ${tiktokDisplayName}` : 'Account connected'}
        statusBlock={
          showDemoHint && !connected ? (
            <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              <strong>Demo mode:</strong> TikTok connect is simulated for testing.
            </p>
          ) : null
        }
        primaryAction={
          !connected && canManageConnections ? (
            <TradiesPostConnectionPrimaryButton onClick={beginConnect}>
              Connect TikTok
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

      <Modal open={showDisconnectModal} onClose={() => setShowDisconnectModal(false)} title="Disconnect TikTok?">
        <p className="mb-6 text-sm text-zinc-600">
          TradiesPost will stop posting to this TikTok account. Scheduled TikTok posts will fail until you reconnect.
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
