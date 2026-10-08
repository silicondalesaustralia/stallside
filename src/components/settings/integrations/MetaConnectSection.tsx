'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Facebook, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import {
  SettingsComingSoonBadge,
  SettingsConnectedBadge,
  SettingsHelpLink,
  SettingsIntegrationCard,
  SettingsNotConnectedBadge,
} from '@/components/settings/SettingsUi'
import {
  MetaConnectGuide,
  type MetaGuideSection,
} from '@/components/settings/integrations/MetaConnectGuide'
import {
  getMetaConnectErrorInfo,
  normalizeMetaErrorCode,
  type MetaConnectErrorCode,
} from '@/lib/social/metaConnectErrors'
import { SocialPlatformComingSoonPanel } from '@/components/social/SocialPlatformComingSoonPanel'
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

type MetaPlatform = 'facebook' | 'instagram'

interface MetaConnectConfig {
  metaConnectEnabled: boolean
  socialDemoMode: boolean
  canUseMetaConnectDemo: boolean
}

interface PendingPage {
  id: string
  name: string
  instagramUsername: string | null
  hasInstagram: boolean
}

interface MetaConnectSectionProps {
  facebookPageId?: string
  facebookPageName?: string
  instagramAccountId?: string
  instagramUsername?: string
  onConnected: () => void
  /** OAuth return path after provider callback (allowlisted). */
  integrationsPath?: string
  /** Rendered first in the social grid (e.g. the mirrored Google Business tile). */
  leading?: React.ReactNode
  children?: React.ReactNode
  /** TradiesPost card layout - hides default StitchedUp nested panels. */
  presentation?: 'default' | 'tradiespost'
  libraryHref?: string
  canManageConnections?: boolean
}

export function MetaConnectSection({
  facebookPageId,
  facebookPageName,
  instagramAccountId,
  instagramUsername,
  onConnected,
  integrationsPath = '/dashboard/social/connections',
  leading,
  children,
  presentation = 'default',
  libraryHref = '/dashboard/social/library',
  canManageConnections = true,
}: MetaConnectSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [config, setConfig] = useState<MetaConnectConfig | null>(null)
  const [errorCode, setErrorCode] = useState<MetaConnectErrorCode | null>(null)
  const [preCheckOpen, setPreCheckOpen] = useState(false)
  const [preCheckPlatform, setPreCheckPlatform] = useState<MetaPlatform>('facebook')
  const [hasPageAnswer, setHasPageAnswer] = useState<'yes' | 'no' | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideSection, setGuideSection] = useState<MetaGuideSection>('before')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSessionId, setPickerSessionId] = useState<string | null>(null)
  const [pickerPlatform, setPickerPlatform] = useState<MetaPlatform>('facebook')
  const [pickerDemo, setPickerDemo] = useState(false)
  const [pendingPages, setPendingPages] = useState<PendingPage[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [pickerLoading, setPickerLoading] = useState(false)
  const [submittingPage, setSubmittingPage] = useState(false)
  const [disconnectPlatform, setDisconnectPlatform] = useState<MetaPlatform | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const clearMetaQueryParams = useCallback(() => {
    router.replace(integrationsPath, { scroll: false })
  }, [router, integrationsPath])

  useEffect(() => {
    fetch('/api/social/connect/meta/config')
      .then((r) => r.json())
      .then((data: MetaConnectConfig) => setConfig(data))
      .catch(() => setConfig({
        metaConnectEnabled: false,
        socialDemoMode: false,
        canUseMetaConnectDemo: false,
      }))
  }, [])

  useEffect(() => {
    const rawError = searchParams.get('meta_error')
    const normalized = normalizeMetaErrorCode(rawError)
    if (normalized) {
      setErrorCode(normalized)
      const info = getMetaConnectErrorInfo(normalized)
      toast(info.message, 'error')
      if (info.guideSection) setGuideSection(info.guideSection)
      clearMetaQueryParams()
    }

    const connected = searchParams.get('meta_connected')
    if (connected === 'facebook') {
      toast('Facebook Page connected', 'success')
      onConnected()
      clearMetaQueryParams()
    } else if (connected === 'instagram') {
      toast('Instagram account connected', 'success')
      onConnected()
      clearMetaQueryParams()
    }

    const pickSession = searchParams.get('meta_pick')
    if (pickSession) {
      setPickerSessionId(pickSession)
      setPickerDemo(searchParams.get('meta_demo') === '1')
      setPickerOpen(true)
      clearMetaQueryParams()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (!pickerOpen || !pickerSessionId) return
    let cancelled = false
    async function loadPending() {
      setPickerLoading(true)
      try {
        const res = await fetch(
          `/api/social/connect/meta/pending?session=${encodeURIComponent(pickerSessionId!)}`,
        )
        const json = await res.json() as {
          platform?: MetaPlatform
          pages?: PendingPage[]
          error?: string
        }
        if (cancelled) return
        if (!res.ok || !json.pages?.length) {
          setErrorCode('invalid_session')
          setPickerOpen(false)
          toast('Connection session expired - please try again.', 'error')
          return
        }
        setPickerPlatform(json.platform ?? 'facebook')
        setPendingPages(json.pages)
        setSelectedPageId(json.pages[0]?.id ?? null)
      } finally {
        if (!cancelled) setPickerLoading(false)
      }
    }
    loadPending()
    return () => { cancelled = true }
  }, [pickerOpen, pickerSessionId, toast])

  function openGuide(section: MetaGuideSection = 'before') {
    setGuideSection(section)
    setGuideOpen(true)
  }

  function beginConnect(platform: MetaPlatform, reconnect = false) {
    setPreCheckPlatform(platform)
    setHasPageAnswer(null)
    setErrorCode(null)
    if (reconnect) {
      continueToMeta(platform)
      return
    }
    setPreCheckOpen(true)
  }

  function continueToMeta(platform: MetaPlatform) {
    setPreCheckOpen(false)
    const returnQuery = encodeURIComponent(integrationsPath)
    if (config?.metaConnectEnabled) {
      window.location.href = `/api/social/connect/meta?platform=${platform}&returnPath=${returnQuery}`
      return
    }
    if (config?.canUseMetaConnectDemo) {
      window.location.href = `/api/social/connect/meta/demo?platform=${platform}&returnPath=${returnQuery}`
      return
    }
    setErrorCode('meta_not_enabled')
    toast(
      'Meta connect is not live yet - App Review and credentials are still being set up.',
      'error',
    )
  }

  async function disconnectMeta(platform: MetaPlatform) {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/social/connect/meta/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(json.error || 'Disconnect failed')
      }
      toast(
        platform === 'facebook' ? 'Facebook Page disconnected' : 'Instagram disconnected',
        'success',
      )
      setDisconnectPlatform(null)
      onConnected()
    } catch {
      toast(
        platform === 'facebook'
          ? 'Failed to disconnect Facebook'
          : 'Failed to disconnect Instagram',
        'error',
      )
    } finally {
      setDisconnecting(false)
    }
  }

  async function confirmPageSelection() {
    if (!pickerSessionId || !selectedPageId) return
    setSubmittingPage(true)
    try {
      const res = await fetch('/api/social/connect/meta/select-page', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId: pickerSessionId, pageId: selectedPageId }),
      })
      const json = await res.json() as { ok?: boolean; platform?: MetaPlatform; error?: string }
      if (!res.ok || !json.ok) {
        const code = normalizeMetaErrorCode(json.error ?? 'server_error') ?? 'server_error'
        setErrorCode(code)
        toast(getMetaConnectErrorInfo(code).message, 'error')
        return
      }
      setPickerOpen(false)
      setPickerSessionId(null)
      toast(
        json.platform === 'instagram'
          ? pickerDemo
            ? 'Instagram connected (demo mode)'
            : 'Instagram account connected'
          : pickerDemo
            ? 'Facebook Page connected (demo mode)'
            : 'Facebook Page connected',
        'success',
      )
      onConnected()
    } catch {
      toast('Could not save Page selection - please try again.', 'error')
    } finally {
      setSubmittingPage(false)
    }
  }

  const errorInfo = errorCode ? getMetaConnectErrorInfo(errorCode) : null
  const showDemoHint = config?.canUseMetaConnectDemo
  const showComingSoon = config && !config.metaConnectEnabled && !config.canUseMetaConnectDemo
  const isTradiesPost = presentation === 'tradiespost'
  const metaExternal = PLATFORM_COMING_SOON.facebook.externalUrl

  return (
    <>
      {errorInfo && (
        <div className={`${isTradiesPost ? 'tp-connections-alert ' : ''}mb-4 rounded-xl border border-red-200 bg-red-50 p-4`}>
          <p className="text-sm font-semibold text-red-800">{errorInfo.title}</p>
          <p className="mt-1 text-sm text-red-700">{errorInfo.message}</p>
          {errorInfo.guideSection && (
            <button
              type="button"
              onClick={() => openGuide(errorInfo.guideSection!)}
              className="mt-2 text-sm font-semibold text-red-900 underline hover:text-red-950"
            >
              View setup guide →
            </button>
          )}
        </div>
      )}

      {showDemoHint && (
        <p className={`${isTradiesPost ? 'tp-connections-alert ' : ''}mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800`}>
          <strong>Demo mode:</strong> Meta connect is simulated locally (SOCIAL_DEMO_MODE). Use Connect below to test the full pre-check and Page picker without live Meta credentials.
        </p>
      )}

      {isTradiesPost ? (
        <>
          <TradiesPostProviderConnectionCard
            testId="tp-connection-facebook"
            name="Facebook"
            benefit="Publish completed job posts to your business Page."
            icon={<Facebook className="h-6 w-6 text-blue-600" />}
            status={
              facebookPageId ? 'connected' : showComingSoon ? 'coming_soon' : 'not_connected'
            }
            connected={Boolean(facebookPageId)}
            connectedDetail={facebookPageName || 'Facebook Page connected'}
            statusBlock={
              !facebookPageId && showComingSoon ? (
                <TradiesPostConnectionComingSoon platform="facebook" />
              ) : null
            }
            primaryAction={
              !facebookPageId && showComingSoon ? (
                <TradiesPostButtonLight href={libraryHref} variant="primary" size="sm" className="w-full">
                  Open Library
                </TradiesPostButtonLight>
              ) : !facebookPageId && !showComingSoon && canManageConnections ? (
                <TradiesPostConnectionPrimaryButton onClick={() => beginConnect('facebook')}>
                  Connect Facebook
                </TradiesPostConnectionPrimaryButton>
              ) : null
            }
            secondaryAction={
              !facebookPageId && showComingSoon && metaExternal ? (
                <TradiesPostConnectionExternalLink href={metaExternal.href}>
                  Open Meta Business Suite →
                </TradiesPostConnectionExternalLink>
              ) : facebookPageId && canManageConnections ? (
                <div className="flex flex-wrap items-center gap-3">
                  <TradiesPostConnectionSecondaryButton onClick={() => beginConnect('facebook', true)}>
                    Reconnect
                  </TradiesPostConnectionSecondaryButton>
                  <button
                    type="button"
                    disabled={disconnecting}
                    onClick={() => setDisconnectPlatform('facebook')}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    data-testid="tp-disconnect-facebook"
                  >
                    Disconnect
                  </button>
                </div>
              ) : !showComingSoon && canManageConnections ? (
                <TradiesPostConnectionHelpLink onClick={() => openGuide('before')}>
                  How to connect →
                </TradiesPostConnectionHelpLink>
              ) : null
            }
          />
          <TradiesPostProviderConnectionCard
            testId="tp-connection-instagram"
            name="Instagram"
            benefit="Share feed posts from your Instagram Business or Creator account."
            icon={<Instagram className="h-6 w-6 text-pink-600" />}
            status={
              instagramAccountId ? 'connected' : showComingSoon ? 'coming_soon' : 'not_connected'
            }
            connected={Boolean(instagramAccountId)}
            connectedDetail={
              instagramUsername ? `@${instagramUsername}` : 'Instagram connected'
            }
            statusBlock={
              !instagramAccountId && showComingSoon ? (
                <TradiesPostConnectionComingSoon platform="instagram" />
              ) : !instagramAccountId && !showComingSoon && !facebookPageId ? (
                <p className="text-xs leading-relaxed text-amber-700">
                  Connect Facebook first, then link Instagram to that Page in Meta&apos;s settings.
                </p>
              ) : null
            }
            primaryAction={
              !instagramAccountId && showComingSoon ? (
                <TradiesPostButtonLight href={libraryHref} variant="primary" size="sm" className="w-full">
                  Open Library
                </TradiesPostButtonLight>
              ) : !instagramAccountId && !showComingSoon && canManageConnections ? (
                <TradiesPostConnectionPrimaryButton
                  onClick={() => beginConnect('instagram')}
                  disabled={!facebookPageId && !config?.canUseMetaConnectDemo}
                >
                  Connect Instagram
                </TradiesPostConnectionPrimaryButton>
              ) : null
            }
            secondaryAction={
              !instagramAccountId && showComingSoon && metaExternal ? (
                <TradiesPostConnectionExternalLink href={metaExternal.href}>
                  Open Meta Business Suite →
                </TradiesPostConnectionExternalLink>
              ) : instagramAccountId && canManageConnections ? (
                <div className="flex flex-wrap items-center gap-3">
                  <TradiesPostConnectionSecondaryButton onClick={() => beginConnect('instagram', true)}>
                    Reconnect
                  </TradiesPostConnectionSecondaryButton>
                  <button
                    type="button"
                    disabled={disconnecting}
                    onClick={() => setDisconnectPlatform('instagram')}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    data-testid="tp-disconnect-instagram"
                  >
                    Disconnect
                  </button>
                </div>
              ) : !showComingSoon && canManageConnections ? (
                <TradiesPostConnectionHelpLink onClick={() => openGuide('setup-instagram')}>
                  How to connect →
                </TradiesPostConnectionHelpLink>
              ) : null
            }
          />
        </>
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {leading}
        <SettingsIntegrationCard
          icon={Facebook}
          iconBgClassName="bg-blue-100"
          iconClassName="text-blue-600"
          title="Facebook"
          description="Publish completed jobs and updates to Facebook."
          badge={
            facebookPageId ? (
              <SettingsConnectedBadge>Connected</SettingsConnectedBadge>
            ) : showComingSoon ? (
              <SettingsComingSoonBadge />
            ) : (
              <SettingsNotConnectedBadge />
            )
          }
          action={
            facebookPageId ? (
              <Button type="button" className="w-full sm:w-auto" onClick={() => beginConnect('facebook', true)}>
                Reconnect
              </Button>
            ) : showComingSoon ? null : (
              <Button type="button" className="w-full sm:w-auto" onClick={() => beginConnect('facebook')}>
                Connect Facebook
              </Button>
            )
          }
          help={
            !showComingSoon ? (
              <SettingsHelpLink onClick={() => openGuide('before')}>How it works</SettingsHelpLink>
            ) : null
          }
        >
          {facebookPageId ? (
            <>
              <p className="text-xs text-[#888]">{facebookPageName || 'Facebook Page connected'}</p>
              <button
                type="button"
                disabled={disconnecting}
                onClick={() => setDisconnectPlatform('facebook')}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Disconnect
              </button>
            </>
          ) : showComingSoon ? (
            <SocialPlatformComingSoonPanel platform="facebook" variant="settings" />
          ) : null}
        </SettingsIntegrationCard>

        <SettingsIntegrationCard
          icon={Instagram}
          iconBgClassName="bg-pink-100"
          iconClassName="text-pink-600"
          title="Instagram"
          description="Publish posts to your Instagram account."
          badge={
            instagramAccountId ? (
              <SettingsConnectedBadge>Connected</SettingsConnectedBadge>
            ) : showComingSoon ? (
              <SettingsComingSoonBadge />
            ) : (
              <SettingsNotConnectedBadge />
            )
          }
          action={
            instagramAccountId ? (
              <Button type="button" className="w-full sm:w-auto" onClick={() => beginConnect('instagram', true)}>
                Reconnect
              </Button>
            ) : showComingSoon ? null : (
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={!facebookPageId && !config?.canUseMetaConnectDemo}
                onClick={() => beginConnect('instagram')}
              >
                Connect Instagram
              </Button>
            )
          }
          help={
            !showComingSoon ? (
              <SettingsHelpLink onClick={() => openGuide('setup-instagram')}>Setup help</SettingsHelpLink>
            ) : null
          }
        >
          {!facebookPageId && !showComingSoon && !instagramAccountId ? (
            <p className="text-xs text-[#888]">Connect Facebook first.</p>
          ) : null}
          {instagramAccountId ? (
            <>
              <p className="text-xs text-[#888]">{instagramUsername ? `@${instagramUsername}` : 'Instagram connected'}</p>
              <button
                type="button"
                disabled={disconnecting}
                onClick={() => setDisconnectPlatform('instagram')}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Disconnect
              </button>
            </>
          ) : showComingSoon ? (
            <SocialPlatformComingSoonPanel platform="instagram" variant="settings" />
          ) : null}
        </SettingsIntegrationCard>
        {children}
      </div>
      )}

      <Modal
        open={preCheckOpen}
        onClose={() => setPreCheckOpen(false)}
        title={preCheckPlatform === 'facebook' ? 'Connect Facebook' : 'Connect Instagram'}
        size="lg"
      >
        <div className="space-y-4">
          {preCheckPlatform === 'facebook' && (
            <>
              <p className="text-sm text-[#666]">
                Do you already have a <strong>Facebook Page</strong> for your business? (Not just a personal profile.)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={hasPageAnswer === 'yes' ? 'primary' : 'outline'}
                  onClick={() => setHasPageAnswer('yes')}
                >
                  Yes, I have a Page
                </Button>
                <Button
                  type="button"
                  variant={hasPageAnswer === 'no' ? 'primary' : 'outline'}
                  onClick={() => setHasPageAnswer('no')}
                >
                  No, I need to create one
                </Button>
              </div>
              {hasPageAnswer === 'no' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Create your Page first</p>
                  <p className="mt-1 text-amber-800">
                    Meta requires a business Page before StitchedUp can publish for you. Follow the guide below, then come back and connect.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setPreCheckOpen(false); openGuide('create-page') }}
                    className="mt-2 font-semibold underline"
                  >
                    Open Page creation guide →
                  </button>
                </div>
              )}
              {hasPageAnswer === 'yes' && (
                <p className="text-xs text-[#888]">
                  On the next Meta screen, opt in to <strong>all Pages and businesses</strong> you manage.
                </p>
              )}
            </>
          )}

          {preCheckPlatform === 'instagram' && (
            <>
              <p className="text-sm text-[#666]">
                Is your Instagram a <strong>Business or Creator</strong> account, linked to your Facebook Page?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => openGuide('setup-instagram')}>
                  Not sure / set up Instagram
                </Button>
                <Button type="button" onClick={() => continueToMeta('instagram')}>
                  Yes - continue to Meta
                </Button>
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-warm-border pt-4">
            {preCheckPlatform === 'facebook' && hasPageAnswer === 'yes' && (
              <Button type="button" onClick={() => continueToMeta('facebook')}>
                Continue to Meta login
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => openGuide('before')}>
              Full setup guide
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPreCheckOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="How to connect Facebook & Instagram"
        size="lg"
      >
        <MetaConnectGuide
          initialSection={guideSection}
          onClose={() => setGuideOpen(false)}
          onStartConnect={() => {
            setGuideOpen(false)
            setPreCheckOpen(true)
          }}
        />
      </Modal>

      <Modal
        open={pickerOpen}
        onClose={() => { if (!submittingPage) setPickerOpen(false) }}
        title={pickerPlatform === 'facebook' ? 'Choose your Facebook Page' : 'Choose Page for Instagram'}
        size="md"
      >
        {pickerLoading ? (
          <p className="text-sm text-[#888]">Loading your Pages…</p>
        ) : (
          <div className="space-y-4">
            {pickerDemo && (
              <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                Demo mode - these Pages are simulated for testing.
              </p>
            )}
            <p className="text-sm text-[#666]">
              Select the Page StitchedUp should use{pickerPlatform === 'instagram' ? ' (must have Instagram linked)' : ''}.
            </p>
            <ul className="space-y-2">
              {pendingPages.map((page) => (
                <li key={page.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-warm-border px-3 py-2.5 hover:bg-surface-nested has-[:checked]:border-brand-yellow has-[:checked]:bg-[#FFFBEA]">
                    <input
                      type="radio"
                      name="meta-page"
                      value={page.id}
                      checked={selectedPageId === page.id}
                      onChange={() => setSelectedPageId(page.id)}
                      className="mt-1 accent-brand-yellow"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[#111]">{page.name}</span>
                      {page.hasInstagram && page.instagramUsername && (
                        <span className="text-xs text-[#888]">@{page.instagramUsername}</span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button
                type="button"
                loading={submittingPage}
                disabled={!selectedPageId}
                onClick={confirmPageSelection}
              >
                Connect this Page
              </Button>
              <Button type="button" variant="outline" disabled={submittingPage} onClick={() => setPickerOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={disconnectPlatform !== null}
        onClose={() => {
          if (!disconnecting) setDisconnectPlatform(null)
        }}
        title={
          disconnectPlatform === 'instagram'
            ? 'Disconnect Instagram?'
            : 'Disconnect Facebook Page?'
        }
      >
        <p className="mb-6 text-sm text-zinc-600">
          {disconnectPlatform === 'instagram'
            ? 'We will stop posting to Instagram. Your Facebook Page stays connected. You can reconnect anytime.'
            : instagramAccountId
              ? 'We will stop posting to Facebook. Instagram will also disconnect because it uses the same Page login. You can reconnect anytime.'
              : 'We will stop posting to this Facebook Page. You can reconnect anytime.'}
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disconnecting}
            onClick={() => setDisconnectPlatform(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={disconnecting || !disconnectPlatform}
            onClick={() => {
              if (disconnectPlatform) void disconnectMeta(disconnectPlatform)
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {disconnecting ? 'Disconnecting…' : 'Disconnect'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
