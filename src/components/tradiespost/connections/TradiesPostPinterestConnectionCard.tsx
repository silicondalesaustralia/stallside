'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  TradiesPostConnectionPrimaryButton,
  TradiesPostConnectionSecondaryButton,
  TradiesPostProviderConnectionCard,
} from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'
import { PinterestBrandIcon } from '@/components/tradiespost/connections/TradiesPostSocialBrandIcons'
import { usePinterestConnect } from '@/components/tradiespost/connections/usePinterestConnect'

type Props = {
  pinterestUserId?: string | null
  pinterestUsername?: string | null
  onConnected: () => void
  integrationsPath: string
  canManageConnections?: boolean
}

export function TradiesPostPinterestConnectionCard({
  pinterestUserId,
  pinterestUsername,
  onConnected,
  integrationsPath,
  canManageConnections = true,
}: Props) {
  const connected = Boolean(pinterestUserId)
  const { canConnect, showDemoHint, beginConnect, disconnect, disconnecting } =
    usePinterestConnect({ integrationsPath, onConnected })
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  async function confirmDisconnect() {
    await disconnect()
    setShowDisconnectModal(false)
  }

  return (
    <>
      <TradiesPostProviderConnectionCard
        testId="tp-connection-pinterest"
        name="Pinterest"
        benefit="Pin your products and recipes so new customers can find you."
        icon={<PinterestBrandIcon />}
        status={connected ? 'connected' : 'not_connected'}
        connected={connected}
        connectedDetail={pinterestUsername ? `Posting as @${pinterestUsername}` : 'Account connected'}
        statusBlock={
          showDemoHint && !connected ? (
            <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              <strong>Demo mode:</strong> Pinterest connect is simulated for testing.
            </p>
          ) : null
        }
        primaryAction={
          !connected && canManageConnections ? (
            <TradiesPostConnectionPrimaryButton onClick={beginConnect}>
              Connect Pinterest
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

      <Modal open={showDisconnectModal} onClose={() => setShowDisconnectModal(false)} title="Disconnect Pinterest?">
        <p className="mb-6 text-sm text-zinc-600">
          Vendl will stop posting to this Pinterest account. Scheduled Pins will fail until you reconnect.
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
