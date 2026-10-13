'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  TradiesPostConnectionPrimaryButton,
  TradiesPostConnectionSecondaryButton,
  TradiesPostProviderConnectionCard,
} from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'
import { XBrandIcon } from '@/components/tradiespost/connections/TradiesPostSocialBrandIcons'
import { useXConnect } from '@/components/tradiespost/connections/useXConnect'

type Props = {
  xUserId?: string | null
  xUsername?: string | null
  onConnected: () => void
  integrationsPath: string
  canManageConnections?: boolean
}

export function TradiesPostXConnectionCard({
  xUserId,
  xUsername,
  onConnected,
  integrationsPath,
  canManageConnections = true,
}: Props) {
  const connected = Boolean(xUserId)
  const { canConnect, showDemoHint, beginConnect, disconnect, disconnecting } =
    useXConnect({ integrationsPath, onConnected })
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  async function confirmDisconnect() {
    await disconnect()
    setShowDisconnectModal(false)
  }

  return (
    <>
      <TradiesPostProviderConnectionCard
        testId="tp-connection-x"
        name="X"
        benefit="Post quick updates like fresh stock and pre-order reminders to X."
        icon={<XBrandIcon />}
        status={connected ? 'connected' : 'not_connected'}
        connected={connected}
        connectedDetail={xUsername ? `Posting as @${xUsername}` : 'Account connected'}
        statusBlock={
          showDemoHint && !connected ? (
            <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              <strong>Demo mode:</strong> X connect is simulated for testing.
            </p>
          ) : null
        }
        primaryAction={
          !connected && canManageConnections ? (
            <TradiesPostConnectionPrimaryButton onClick={beginConnect}>
              Connect X
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

      <Modal open={showDisconnectModal} onClose={() => setShowDisconnectModal(false)} title="Disconnect X?">
        <p className="mb-6 text-sm text-zinc-600">
          Vendl will stop posting to this X account. Scheduled posts to X will fail until you reconnect.
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
