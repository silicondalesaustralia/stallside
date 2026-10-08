'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'
import { useGmbConnect } from '@/components/settings/integrations/GmbConnectContext'
import { TradiesPostConnectionComingSoon } from '@/components/tradiespost/connections/TradiesPostConnectionComingSoon'
import {
  TradiesPostConnectionExternalLink,
  TradiesPostConnectionHelpLink,
  TradiesPostConnectionPrimaryButton,
  TradiesPostConnectionSecondaryButton,
  TradiesPostProviderConnectionCard,
} from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'
import { TradiesPostButtonLight } from '@/components/tradiespost/ui/TradiesPostButton'
import { PLATFORM_COMING_SOON } from '@/lib/social/platformComingSoonContent'

function GoogleBusinessIcon() {
  return <Search className="h-6 w-6 text-green-600" aria-hidden />
}

/**
 * Single consolidated Google Business card for TradiesPost.
 * Replaces the duplicate GmbConnectSection tile + GmbProfileCard pair.
 */
export function TradiesPostGmbConnectionCard({
  canManageConnections = true,
}: {
  canManageConnections?: boolean
}) {
  const {
    connected,
    gmbLocationName,
    canConnect,
    showComingSoon,
    showDemoHint,
    errorInfo,
    disconnecting,
    beginConnect,
    openGuide,
    disconnectGmb,
  } = useGmbConnect()
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  async function confirmDisconnect() {
    await disconnectGmb()
    setShowDisconnectModal(false)
  }

  const googleExternal = PLATFORM_COMING_SOON.google_business.externalUrl

  return (
    <>
      {errorInfo && (
        <div className="tp-connections-alert mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">{errorInfo.title}</p>
          <p className="mt-1 text-sm text-red-700">{errorInfo.message}</p>
          {errorInfo.guideSection && (
            <button
              type="button"
              onClick={() => openGuide(errorInfo.guideSection!)}
              className="mt-2 text-sm font-semibold text-red-900 underline"
            >
              View setup guide →
            </button>
          )}
        </div>
      )}

      {showDemoHint && (
        <p className="tp-connections-alert mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <strong>Demo mode:</strong> Google Business connect is simulated locally for testing.
        </p>
      )}

      <TradiesPostProviderConnectionCard
        testId="tp-connection-google"
        name="Google Business Profile"
        benefit="Show up on Google Search and Maps with local job posts."
        icon={<GoogleBusinessIcon />}
        status={
          connected ? 'connected' : showComingSoon ? 'coming_soon' : 'not_connected'
        }
        connected={connected}
        connectedDetail={gmbLocationName || 'Location connected'}
        statusBlock={
          !connected && showComingSoon ? (
            <TradiesPostConnectionComingSoon platform="google_business" />
          ) : null
        }
        primaryAction={
          !connected && showComingSoon ? (
            <TradiesPostButtonLight href="/dashboard/social/library" variant="primary" size="sm" className="w-full">
              Open Library
            </TradiesPostButtonLight>
          ) : !connected && canConnect && canManageConnections ? (
            <TradiesPostConnectionPrimaryButton onClick={() => beginConnect()}>
              Connect Google Business
            </TradiesPostConnectionPrimaryButton>
          ) : null
        }
        secondaryAction={
          !connected && showComingSoon && googleExternal ? (
            <TradiesPostConnectionExternalLink href={googleExternal.href}>
              {googleExternal.label} →
            </TradiesPostConnectionExternalLink>
          ) : !connected && canConnect && canManageConnections ? (
            <TradiesPostConnectionHelpLink onClick={() => openGuide('before')}>
              How to connect →
            </TradiesPostConnectionHelpLink>
          ) : connected && canManageConnections ? (
            <div className="flex flex-wrap items-center gap-3">
              {canConnect && (
                <TradiesPostConnectionSecondaryButton onClick={() => beginConnect(true)}>
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

      <Modal
        open={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="Disconnect Google Business Profile?"
      >
        <p className="mb-6 text-sm text-zinc-600">
          TradiesPost will stop posting to this listing. You can reconnect at any time.
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
