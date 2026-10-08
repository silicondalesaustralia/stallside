'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { GmbConnectGuide } from '@/components/settings/integrations/GmbConnectGuide'
import {
  getGmbConnectErrorInfo,
  normalizeGmbErrorCode,
  type GmbConnectErrorCode,
  type GmbGuideSection,
} from '@/lib/social/gmbConnectErrors'

export const GBP_INTEGRATION_CARD_ID = 'google-business-profile'

interface GmbConnectConfig {
  gmbConnectEnabled: boolean
  socialDemoMode: boolean
  canUseGmbConnectDemo: boolean
}

interface PendingLocation {
  id: string
  title: string
}

export interface GmbConnectContextValue {
  gmbAccountId?: string
  gmbLocationName?: string
  connected: boolean
  canConnect: boolean
  showComingSoon: boolean
  showDemoHint: boolean
  errorInfo: ReturnType<typeof getGmbConnectErrorInfo> | null
  disconnecting: boolean
  beginConnect: (reconnect?: boolean) => void
  openGuide: (section?: GmbGuideSection) => void
  disconnectGmb: () => Promise<void>
  scrollToCard: () => void
}

const GmbConnectContext = createContext<GmbConnectContextValue | null>(null)

export function useGmbConnect(): GmbConnectContextValue {
  const ctx = useContext(GmbConnectContext)
  if (!ctx) {
    throw new Error('useGmbConnect must be used inside GmbConnectProvider')
  }
  return ctx
}

interface GmbConnectProviderProps {
  gmbAccountId?: string
  gmbLocationName?: string
  onConnected: () => void
  integrationsPath?: string
  children: ReactNode
}

export function GmbConnectProvider({
  gmbAccountId,
  gmbLocationName,
  onConnected,
  integrationsPath = '/dashboard/social/connections',
  children,
}: GmbConnectProviderProps) {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [config, setConfig] = useState<GmbConnectConfig | null>(null)
  const [errorCode, setErrorCode] = useState<GmbConnectErrorCode | null>(null)
  const [preCheckOpen, setPreCheckOpen] = useState(false)
  const [hasProfileAnswer, setHasProfileAnswer] = useState<'yes' | 'no' | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideSection, setGuideSection] = useState<GmbGuideSection>('before')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSessionId, setPickerSessionId] = useState<string | null>(null)
  const [pickerDemo, setPickerDemo] = useState(false)
  const [pendingLocations, setPendingLocations] = useState<PendingLocation[]>([])
  const [accountName, setAccountName] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [pickerLoading, setPickerLoading] = useState(false)
  const [submittingLocation, setSubmittingLocation] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const clearGmbQueryParams = useCallback(() => {
    router.replace(integrationsPath, { scroll: false })
  }, [router, integrationsPath])

  useEffect(() => {
    fetch('/api/social/connect/gmb/config')
      .then((r) => r.json())
      .then((data: GmbConnectConfig) => setConfig(data))
      .catch(() => setConfig({
        gmbConnectEnabled: false,
        socialDemoMode: false,
        canUseGmbConnectDemo: false,
      }))
  }, [])

  useEffect(() => {
    const rawError = searchParams.get('gmb_error')
    const normalized = normalizeGmbErrorCode(rawError)
    if (normalized) {
      setErrorCode(normalized)
      const info = getGmbConnectErrorInfo(normalized)
      toast(info.message, 'error')
      if (info.guideSection) setGuideSection(info.guideSection)
      clearGmbQueryParams()
    }

    if (searchParams.get('gmb_connected') === '1') {
      toast('Google Business Profile connected', 'success')
      onConnected()
      clearGmbQueryParams()
    }

    const pickSession = searchParams.get('gmb_pick')
    if (pickSession) {
      setPickerSessionId(pickSession)
      setPickerDemo(searchParams.get('gmb_demo') === '1')
      setPickerOpen(true)
      clearGmbQueryParams()
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
          `/api/social/connect/gmb/pending?session=${encodeURIComponent(pickerSessionId!)}`,
        )
        const json = await res.json() as {
          accountName?: string
          locations?: PendingLocation[]
          error?: string
        }
        if (cancelled) return
        if (!res.ok || !json.locations?.length) {
          setErrorCode('invalid_session')
          setPickerOpen(false)
          toast('Connection session expired - please try again.', 'error')
          return
        }
        setAccountName(json.accountName ?? null)
        setPendingLocations(json.locations)
        setSelectedLocationId(json.locations[0]?.id ?? null)
      } finally {
        if (!cancelled) setPickerLoading(false)
      }
    }
    loadPending()
    return () => { cancelled = true }
  }, [pickerOpen, pickerSessionId, toast])

  const canConnect = Boolean(config?.gmbConnectEnabled || config?.canUseGmbConnectDemo)
  const showComingSoon = Boolean(config && !config.gmbConnectEnabled && !config.canUseGmbConnectDemo)
  const showDemoHint = Boolean(config?.canUseGmbConnectDemo)
  const errorInfo = errorCode ? getGmbConnectErrorInfo(errorCode) : null

  function openGuide(section: GmbGuideSection = 'before') {
    setGuideSection(section)
    setGuideOpen(true)
  }

  function continueToGmb() {
    setPreCheckOpen(false)
    const returnQuery = encodeURIComponent(integrationsPath)
    if (config?.gmbConnectEnabled) {
      window.location.href = `/api/social/connect/gmb?returnPath=${returnQuery}`
      return
    }
    if (config?.canUseGmbConnectDemo) {
      window.location.href = `/api/social/connect/gmb/demo?returnPath=${returnQuery}`
      return
    }
    setErrorCode('gmb_not_enabled')
    toast(
      'Google Business connect is not live yet - waiting on Google API approval.',
      'error',
    )
  }

  function beginConnect(reconnect = false) {
    setErrorCode(null)
    if (reconnect) {
      continueToGmb()
      return
    }
    setHasProfileAnswer(null)
    setPreCheckOpen(true)
  }

  async function confirmLocationSelection() {
    if (!pickerSessionId || !selectedLocationId) return
    setSubmittingLocation(true)
    try {
      const res = await fetch('/api/social/connect/gmb/select-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: pickerSessionId, locationId: selectedLocationId }),
      })
      const json = await res.json() as { ok?: boolean; demo?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        const code = normalizeGmbErrorCode(json.error ?? 'server_error') ?? 'server_error'
        setErrorCode(code)
        toast(getGmbConnectErrorInfo(code).message, 'error')
        return
      }
      setPickerOpen(false)
      setPickerSessionId(null)
      toast(
        json.demo
          ? 'Google Business connected (demo mode)'
          : 'Google Business Profile connected',
        'success',
      )
      onConnected()
    } catch {
      toast('Could not save location selection - please try again.', 'error')
    } finally {
      setSubmittingLocation(false)
    }
  }

  async function disconnectGmb() {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/social/connect/gmb/disconnect', { method: 'POST' })
      if (!res.ok) throw new Error('Disconnect failed')
      toast('Google Business Profile disconnected', 'success')
      onConnected()
    } catch {
      toast('Failed to disconnect Google Business', 'error')
    } finally {
      setDisconnecting(false)
    }
  }

  function scrollToCard() {
    const el = document.getElementById(GBP_INTEGRATION_CARD_ID)
    if (!el) return
    const scroller = el.closest('main')
    if (scroller) {
      const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
      scroller.scrollTo({ top: Math.max(0, top - 12), behavior: 'smooth' })
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const value: GmbConnectContextValue = {
    gmbAccountId,
    gmbLocationName,
    connected: Boolean(gmbAccountId),
    canConnect,
    showComingSoon,
    showDemoHint,
    errorInfo,
    disconnecting,
    beginConnect,
    openGuide,
    disconnectGmb,
    scrollToCard,
  }

  return (
    <GmbConnectContext.Provider value={value}>
      {children}

      <Modal
        open={preCheckOpen}
        onClose={() => setPreCheckOpen(false)}
        title="Connect Google Business Profile"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#666]">
            Do you already have a <strong>verified Google Business Profile</strong> listing for your trade business?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={hasProfileAnswer === 'yes' ? 'primary' : 'outline'}
              onClick={() => setHasProfileAnswer('yes')}
            >
              Yes, I have a profile
            </Button>
            <Button
              type="button"
              variant={hasProfileAnswer === 'no' ? 'primary' : 'outline'}
              onClick={() => setHasProfileAnswer('no')}
            >
              No, I need to set one up
            </Button>
          </div>
          {hasProfileAnswer === 'no' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Create and verify your profile first</p>
              <p className="mt-1 text-amber-800">
                Google requires a Business Profile before Vendl can publish for you. Follow the guide below, then return and connect.
              </p>
              <button
                type="button"
                onClick={() => { setPreCheckOpen(false); openGuide('create-profile') }}
                className="mt-2 font-semibold underline"
              >
                Open setup guide →
              </button>
            </div>
          )}
          {hasProfileAnswer === 'yes' && (
            <p className="text-xs text-[#888]">
              On the next screen, sign in with the Google account that is an <strong>owner or manager</strong> on your listing.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 border-t border-warm-border pt-4">
            {hasProfileAnswer === 'yes' && (
              <Button type="button" onClick={continueToGmb}>
                Continue to Google sign-in
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
        title="How to connect Google Business Profile"
        size="lg"
      >
        <GmbConnectGuide
          initialSection={guideSection}
          onClose={() => setGuideOpen(false)}
          onStartConnect={canConnect ? () => {
            setGuideOpen(false)
            setPreCheckOpen(true)
          } : undefined}
        />
      </Modal>

      <Modal
        open={pickerOpen}
        onClose={() => { if (!submittingLocation) setPickerOpen(false) }}
        title="Choose your business location"
        size="md"
      >
        {pickerLoading ? (
          <p className="text-sm text-[#888]">Loading your locations…</p>
        ) : (
          <div className="space-y-4">
            {pickerDemo && (
              <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                Demo mode - these locations are simulated for testing.
              </p>
            )}
            <p className="text-sm text-[#666]">
              {accountName
                ? <>Select which location Vendl should post to for <strong>{accountName}</strong>.</>
                : 'Select the location Vendl should post to.'}
            </p>
            <ul className="space-y-2">
              {pendingLocations.map((loc) => (
                <li key={loc.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-warm-border px-3 py-2.5 hover:bg-surface-nested has-[:checked]:border-brand-yellow has-[:checked]:bg-[#FFFBEA]">
                    <input
                      type="radio"
                      name="gmb-location"
                      value={loc.id}
                      checked={selectedLocationId === loc.id}
                      onChange={() => setSelectedLocationId(loc.id)}
                      className="mt-1 accent-brand-yellow"
                    />
                    <span className="text-sm font-medium text-[#111]">{loc.title}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button
                type="button"
                loading={submittingLocation}
                disabled={!selectedLocationId}
                onClick={confirmLocationSelection}
              >
                Connect this location
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submittingLocation}
                onClick={() => setPickerOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </GmbConnectContext.Provider>
  )
}
