'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import type { InspirationComposePrefill, InspirationVariantPreview } from '@/lib/social/inspirationTypes'
import { InspirationEntryPanel } from '@/components/social/InspirationEntryPanel'
import { InspirationStyleGuidePanel } from '@/components/social/InspirationStyleGuidePanel'
import { CreativeDirectionCard } from '@/components/social/CreativeDirectionCard'
import { InspirationPreviewCard } from '@/components/social/InspirationPreviewCard'
import {
  initialTunedState,
  RecreateTunePanel,
  type TunedVariantState,
} from '@/components/social/RecreateTunePanel'
import { shouldShowRecreateTune } from '@/lib/social/recreateTuneVisibility'
import { shouldChargeOnRecreateSave } from '@/lib/social/recreateFinalize'
import { logRecreateAnalytics } from '@/lib/social/recreateAnalytics'
import { useToast } from '@/components/ui/Toast'
import { useRenderCredits } from '@/hooks/useRenderCredits'
import type { CreateTabBusiness } from '@/components/social/CreateTab'
import { COMPOSE_STEP_CARD } from '@/lib/social/socialDesignTokens'
import { readApiJson } from '@/lib/http/readApiJson'
import type { CreativeDirection } from '@/lib/social/creativeDirection'
import { RecreateCampaignFocusField } from '@/components/social/RecreateCampaignFocusField'
import { parseCampaignFocus } from '@/lib/social/normalizeCampaignFocus'
import {
  RECREATE_MESSAGE_ANGLE_LABELS,
  RECREATE_MESSAGE_ANGLES,
  type RecreateMessageAngle,
} from '@/lib/social/recreateMessageAngles'
import { RECREATE_MODE_COPY, type RecreateMode } from '@/lib/social/recreateModes'
import { readNdjsonStream } from '@/lib/social/readNdjsonStream'
import { revokeInspirationPreviewSrc } from '@/lib/social/inspirationPreview'
import {
  RecreateLogoPicker,
  type RecreateLogoSelection,
} from '@/components/social/RecreateLogoPicker'
import { RecreateBrandingControls } from '@/components/social/RecreateBrandingControls'
import {
  RECREATE_DEFAULT_LOGO_POSITION,
  RECREATE_DEFAULT_LOGO_SIZE,
  type RecreateLogoPosition,
  type RecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'
import { InfoGuide, InfoGuideLabel } from '@/components/ui/InfoGuide'
import { MESSAGE_ANGLE_HELP } from '@/lib/social/socialHelpContent'

type CarryPhotoPayload = { base64: string; mimeType: string }

type AnalyzeSuccessExtras = {
  referenceRecreateEnabled?: boolean
  creativeDirection?: CreativeDirection
  previewSrc?: string | null
}

type SlotState = {
  angle: RecreateMessageAngle
  status: 'pending' | 'ready' | 'failed'
  variant: InspirationVariantPreview | null
  error: string | null
}

function emptySlots(): SlotState[] {
  return RECREATE_MESSAGE_ANGLES.map((angle) => ({
    angle,
    status: 'pending' as const,
    variant: null,
    error: null,
  }))
}

export function RecreateTab({
  business,
  onSwitchToScratch,
  onPostCreated,
}: {
  business: CreateTabBusiness
  onSwitchToScratch: (carryPhoto?: CarryPhotoPayload) => void
  onPostCreated: () => void
}) {
  const { toast } = useToast()
  const { credits, refresh: refreshCredits } = useRenderCredits()

  const [prefill, setPrefill] = useState<InspirationComposePrefill | null>(null)
  const [referenceRecreateEnabled, setReferenceRecreateEnabled] = useState(false)
  const [creativeDirection, setCreativeDirection] = useState<CreativeDirection | null>(null)
  const [campaignFocus, setCampaignFocus] = useState('')
  const [recreateMode, setRecreateMode] = useState<RecreateMode | null>(null)
  const [variants, setVariants] = useState<InspirationVariantPreview[]>([])
  const [slots, setSlots] = useState<SlotState[] | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [generatingVariants, setGeneratingVariants] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)
  const [finalRenderId, setFinalRenderId] = useState<string | null>(null)
  const [tuned, setTuned] = useState<TunedVariantState | null>(null)
  const [referenceStoragePath, setReferenceStoragePath] = useState<string | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [logoChoice, setLogoChoice] = useState<RecreateLogoSelection>({
    logoAssetId: undefined,
    logoVariantType: null,
  })
  const [updatingVariantId, setUpdatingVariantId] = useState<string | null>(null)
  const brandingRequestRef = useRef(0)
  const [inspirationPreviewSrc, setInspirationPreviewSrc] = useState<string | null>(null)
  const inspirationPreviewSrcRef = useRef<string | null>(null)
  const carryPhotoRef = useRef<CarryPhotoPayload | null>(null)
  const generateLockRef = useRef(false)

  const adoptInspirationPreview = useCallback((next: string | null | undefined) => {
    const current = inspirationPreviewSrcRef.current
    if (current && current !== next) {
      revokeInspirationPreviewSrc(current)
    }
    inspirationPreviewSrcRef.current = next?.trim() || null
    setInspirationPreviewSrc(inspirationPreviewSrcRef.current)
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/social/recreate-config')
        const json = await readApiJson<{ referenceRecreateEnabled?: boolean }>(res)
        if (!cancelled && res.ok) {
          setReferenceRecreateEnabled(Boolean(json.referenceRecreateEnabled))
        }
      } catch {
        // Default remains off - analyze extras can still enable the new path.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      revokeInspirationPreviewSrc(inspirationPreviewSrcRef.current)
      inspirationPreviewSrcRef.current = null
    }
  }, [])

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null
  const readyCount = slots?.filter((s) => s.status === 'ready').length ?? 0
  const isReferenceResult = selectedVariant?.visualPath === 'reference_recreation'

  const handleAnalysisSuccess = useCallback((
    next: InspirationComposePrefill,
    storagePath?: string | null,
    extras?: AnalyzeSuccessExtras,
  ) => {
    setPrefill(next)
    setReferenceStoragePath(storagePath?.trim() || null)
    setReferenceRecreateEnabled(Boolean(extras?.referenceRecreateEnabled))
    setCreativeDirection(extras?.creativeDirection ?? null)
    adoptInspirationPreview(extras?.previewSrc)
    setCampaignFocus('')
    setRecreateMode(null)
    setVariants([])
    setSlots(null)
    setSelectedVariantId(null)
    setFinalImageUrl(null)
    setFinalRenderId(null)
    setTuned(null)
    setStreamError(null)
    toast(
      extras?.referenceRecreateEnabled
        ? 'Creative direction ready - choose Closest or Fresh take'
        : `Matched ${next.matchedLabel} - review the style guide, then generate variants`,
      'success',
    )
  }, [toast, adoptInspirationPreview])

  const handleGenerateLegacy = useCallback(async () => {
    if (!prefill || generateLockRef.current) return
    generateLockRef.current = true
    setGeneratingVariants(true)
    setVariants([])
    setSelectedVariantId(null)
    setFinalImageUrl(null)
    setFinalRenderId(null)
    setTuned(null)

    try {
      const res = await fetch('/api/social/inspiration-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefill,
          platform: 'instagram',
          storagePath: referenceStoragePath,
        }),
      })
      const json = await readApiJson<{ variants?: InspirationVariantPreview[]; error?: string }>(res)
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate variants')
      }
      setVariants(json.variants ?? [])
      setReferenceStoragePath(null)
      if (!json.variants?.length) {
        throw new Error('No variants returned')
      }
      toast(`${json.variants.length} preview variants ready - pick one, tune it, then save (1 credit)`, 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Variant generation failed', 'error')
    } finally {
      generateLockRef.current = false
      setGeneratingVariants(false)
    }
  }, [prefill, referenceStoragePath, toast])

  const handleGenerateReference = useCallback(async () => {
    if (!prefill || !recreateMode || generateLockRef.current) return
    const parsedFocus = parseCampaignFocus(campaignFocus)
    if (!parsedFocus.ok) {
      toast(parsedFocus.error, 'error')
      return
    }
    generateLockRef.current = true
    setGeneratingVariants(true)
    setVariants([])
    setSlots(emptySlots())
    setSelectedVariantId(null)
    setFinalImageUrl(null)
    setFinalRenderId(null)
    setTuned(null)
    setStreamError(null)

    const generationId = crypto.randomUUID()
    const nextVariants: InspirationVariantPreview[] = []

    try {
      const res = await fetch('/api/social/inspiration-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefill,
          platform: 'instagram',
          storagePath: referenceStoragePath,
          recreateMode,
          campaignFocus: campaignFocus.trim() || null,
          generationId,
          showLogo: logoChoice.logoAssetId !== null,
          logoAssetId:
            logoChoice.logoAssetId === undefined ? undefined : logoChoice.logoAssetId,
        }),
      })

      if (res.status === 402) {
        const json = await readApiJson<{ error?: string }>(res)
        throw new Error(json.error || 'No render credits remaining')
      }
      if (!res.ok || !res.body) {
        const json = await readApiJson<{ error?: string }>(res)
        throw new Error(json.error || 'Failed to generate versions')
      }

      await readNdjsonStream(res.body, (event) => {
        const type = event.type
        if (type === 'variant' && event.variant && typeof event.index === 'number') {
          const variant = event.variant as InspirationVariantPreview
          nextVariants.push(variant)
          setVariants([...nextVariants])
          setSlots((prev) => {
            const next = prev ? [...prev] : emptySlots()
            next[event.index as number] = {
              angle: variant.messageAngle ?? RECREATE_MESSAGE_ANGLES[event.index as number],
              status: 'ready',
              variant,
              error: null,
            }
            return next
          })
        }
        if (type === 'variant_failed' && typeof event.index === 'number') {
          setSlots((prev) => {
            const next = prev ? [...prev] : emptySlots()
            next[event.index as number] = {
              ...next[event.index as number],
              status: 'failed',
              error: typeof event.error === 'string' ? event.error : 'This version failed',
            }
            return next
          })
        }
        if (type === 'error') {
          const refunded = event.creditRefunded === true
          const message =
            (typeof event.error === 'string' && event.error) ||
            'Could not create versions'
          setStreamError(
            refunded ? `${message} Your credit was returned.` : message,
          )
        }
      })

      setReferenceStoragePath(null)
      await refreshCredits()
      if (nextVariants.length > 0) {
        toast(`${nextVariants.length} of 3 versions ready`, 'success')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Variant generation failed'
      setStreamError(message)
      toast(message, 'error')
      await refreshCredits()
    } finally {
      generateLockRef.current = false
      setGeneratingVariants(false)
    }
  }, [prefill, recreateMode, campaignFocus, referenceStoragePath, toast, refreshCredits, logoChoice])

  async function persistLibraryCaption(renderId: string) {
    try {
      const res = await fetch('/api/social/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'instagram',
          brandVoice: business.social_brand_voice || 'professional',
        }),
      })
      const json = await res.json()
      const text = json.captions?.[0]
      if (!res.ok || !text?.trim()) return
      await fetch(`/api/social/hybrid-renders/${renderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: text.trim() }),
      })
    } catch {
      // Library can still generate on demand
    }
  }

  function selectVariant(variant: InspirationVariantPreview) {
    setSelectedVariantId(variant.id)
    setTuned(initialTunedState(variant, business))
    logRecreateAnalytics('recreate_variant_selected', {
      recreateMode: variant.recreateMode ?? recreateMode,
      messageAngle: variant.messageAngle ?? null,
      visualPath: variant.visualPath ?? null,
      hadCampaignFocus: Boolean(variant.campaignFocus ?? campaignFocus.trim()),
    })
  }

  const handleFinalizeVariant = useCallback(async () => {
    if (!selectedVariant || !prefill || !tuned) return
    setFinalizing(true)

    try {
      const photoUrl = tuned.backgroundUrl || tuned.imageUrl
      const isReference = !shouldChargeOnRecreateSave(selectedVariant.visualPath)
      const res = await fetch('/api/social/hybrid-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: selectedVariant.format,
          preset: selectedVariant.infographicPreset,
          platform: 'instagram',
          photoSource: selectedVariant.photoSource,
          photoUrl,
          content: tuned.content,
          logoCorner: tuned.logoCorner,
          textStyles: tuned.textStyles,
          showLogo: tuned.showLogo,
          passThroughVisual: isReference,
          recreateMeta: isReference
            ? {
                recreateMode: selectedVariant.recreateMode ?? recreateMode,
                messageAngle: selectedVariant.messageAngle ?? null,
                campaignFocus: selectedVariant.campaignFocus ?? (campaignFocus.trim() || null),
                visualPath: 'reference_recreation',
                imageModel: selectedVariant.imageModel ?? null,
                logoAssetId: selectedVariant.logoAssetId ?? logoChoice.logoAssetId ?? null,
                logoVariantType:
                  selectedVariant.logoVariantType ?? logoChoice.logoVariantType ?? null,
                logoDisabled: selectedVariant.logoDisabled === true || logoChoice.logoAssetId === null,
                logoPosition: selectedVariant.logoPosition ?? RECREATE_DEFAULT_LOGO_POSITION,
                logoSize: selectedVariant.logoSize ?? RECREATE_DEFAULT_LOGO_SIZE,
              }
            : undefined,
        }),
      })
      const json = await readApiJson<{
        imageUrl?: string
        resultUrl?: string
        id?: string
        usedFreeTrial?: boolean
        creditsCharged?: number
        error?: string
        detail?: string
        code?: string
      }>(res)
      if (!res.ok) {
        if (json.code === 'no_render_credits') {
          throw new Error(json.error || 'No render credits remaining')
        }
        throw new Error(json.error || 'Finalize failed')
      }

      setFinalImageUrl(json.imageUrl || json.resultUrl || null)
      setFinalRenderId(json.id ?? null)
      if (json.id) {
        void persistLibraryCaption(json.id)
      }
      await refreshCredits()
      toast(
        isReference
          ? 'Saved to Library'
          : json.usedFreeTrial
            ? 'Variant saved - free trial credit used'
            : 'Variant saved - 1 render credit used',
        'success',
      )
      onPostCreated()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Finalize failed', 'error')
    } finally {
      setFinalizing(false)
    }
  }, [selectedVariant, prefill, tuned, recreateMode, campaignFocus, refreshCredits, toast, onPostCreated, logoChoice])

  async function applyBrandingToSelected(next: {
    logoAssetId: string | null | undefined
    logoVariantType: string | null
    logoPosition: RecreateLogoPosition
    logoSize: RecreateLogoSize
  }) {
    const target = selectedVariant
    if (!target?.baseStoragePath || target.visualPath !== 'reference_recreation' || generatingVariants) {
      return
    }
    const requestId = brandingRequestRef.current + 1
    brandingRequestRef.current = requestId
    setUpdatingVariantId(target.id)
    try {
      const res = await fetch('/api/social/recreate-apply-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoAssetId: next.logoAssetId === undefined ? undefined : next.logoAssetId,
          showLogo: next.logoAssetId !== null,
          logoPosition: next.logoPosition,
          logoSize: next.logoSize,
          items: [{ id: target.id, baseStoragePath: target.baseStoragePath }],
        }),
      })
      const json = await readApiJson<{
        results?: Array<{
          id: string
          imageUrl: string
          logoAssetId: string | null
          logoVariantType: string | null
          logoDisabled: boolean
          logoPosition?: RecreateLogoPosition
          logoSize?: RecreateLogoSize
        }>
        error?: string
      }>(res)
      if (!res.ok) throw new Error(json.error || 'Failed to update logo')
      if (brandingRequestRef.current !== requestId) return
      const row = json.results?.[0]
      if (!row) return
      const patch = {
        imageUrl: row.imageUrl,
        backgroundUrl: row.imageUrl,
        logoAssetId: row.logoAssetId,
        logoVariantType: row.logoVariantType,
        logoDisabled: row.logoDisabled,
        logoPosition: row.logoPosition ?? next.logoPosition,
        logoSize: row.logoSize ?? next.logoSize,
      }
      setVariants((prev) =>
        prev.map((variant) => (variant.id === target.id ? { ...variant, ...patch } : variant)),
      )
      setSlots((prev) =>
        prev
          ? prev.map((slot) =>
              slot.variant?.id === target.id && slot.variant
                ? { ...slot, variant: { ...slot.variant, ...patch } }
                : slot,
            )
          : prev,
      )
      setTuned((prev) => (prev ? { ...prev, imageUrl: row.imageUrl, backgroundUrl: row.imageUrl } : prev))
      logRecreateAnalytics('recreate_logo_adjusted', {
        logoVariantType: row.logoVariantType,
        logoPosition: patch.logoPosition,
        logoSize: patch.logoSize,
        logoDisabled: row.logoDisabled,
      })
    } catch (err) {
      if (brandingRequestRef.current === requestId) {
        toast(err instanceof Error ? err.message : 'Failed to update logo', 'error')
      }
    } finally {
      if (brandingRequestRef.current === requestId) {
        setUpdatingVariantId(null)
      }
    }
  }

  function handleNoMatch(message: string, carryPhoto?: CarryPhotoPayload) {
    carryPhotoRef.current = carryPhoto ?? null
  }

  function switchToScratch() {
    onSwitchToScratch(carryPhotoRef.current ?? undefined)
  }

  function startOver() {
    adoptInspirationPreview(null)
    setPrefill(null)
    setCreativeDirection(null)
    setCampaignFocus('')
    setRecreateMode(null)
    setVariants([])
    setSlots(null)
    setSelectedVariantId(null)
    setFinalImageUrl(null)
    setFinalRenderId(null)
    setTuned(null)
    setReferenceStoragePath(null)
    setStreamError(null)
    setLogoChoice({ logoAssetId: undefined, logoVariantType: null })
    carryPhotoRef.current = null
  }

  function replaceInspiration() {
    startOver()
  }

  const showNoMatchActions =
    prefill === null &&
    variants.length === 0 &&
    !finalImageUrl

  const creditLabel = credits
    ? credits.canRender
      ? credits.creditsRemaining > 0
        ? `${credits.creditsRemaining} render credit${credits.creditsRemaining === 1 ? '' : 's'} left`
        : '1 free trial render available'
      : 'No render credits left'
    : null

  return (
    <div className="space-y-4" data-testid="recreate-tab">
      {!(prefill && referenceRecreateEnabled) && (
        <InspirationEntryPanel
          onPrefill={(next, storagePath, extras) => {
            handleAnalysisSuccess(next, storagePath, extras)
          }}
          onAnalysisFailed={handleNoMatch}
          onSwitchToScratch={switchToScratch}
          onCarryPhoto={({ base64, mimeType }) => {
            carryPhotoRef.current = { base64, mimeType }
          }}
        />
      )}

      {prefill && !referenceRecreateEnabled && (
        <>
          <InspirationStyleGuidePanel prefill={prefill} />

          <div className={COMPOSE_STEP_CARD}>
            <div className="p-4 space-y-3">
              <p className="text-xs text-[#666] leading-relaxed">
                We&apos;ll create 3 distinct preview variants inspired by your reference.
                Previews are free - only your chosen variant uses 1 render credit.
              </p>
              <button
                type="button"
                disabled={generatingVariants}
                onClick={() => void handleGenerateLegacy()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {generatingVariants ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating variants…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate 3 variants
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {prefill && referenceRecreateEnabled && (
        <>
          <div
            className={
              inspirationPreviewSrc && creativeDirection
                ? 'grid gap-4 lg:grid-cols-[minmax(180px,240px)_1fr]'
                : 'grid gap-4'
            }
          >
            {inspirationPreviewSrc ? (
              <InspirationPreviewCard
                src={inspirationPreviewSrc}
                onReplace={replaceInspiration}
              />
            ) : null}
            {creativeDirection && <CreativeDirectionCard direction={creativeDirection} />}
          </div>

          <div className={COMPOSE_STEP_CARD}>
            <RecreateCampaignFocusField
              value={campaignFocus}
              onChange={setCampaignFocus}
              disabled={generatingVariants}
            />
          </div>

          <div className={COMPOSE_STEP_CARD}>
            <div className="p-4 space-y-3">
              <p className="text-sm font-black text-[#111]">How should we use this?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['closest', 'fresh_take'] as const).map((mode) => {
                  const selected = recreateMode === mode
                  return (
                    <div key={mode} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setRecreateMode(mode)
                          logRecreateAnalytics('recreate_mode_selected', {
                            recreateMode: mode,
                            visualPath: 'reference_recreation',
                            hadCampaignFocus: Boolean(campaignFocus.trim()),
                          })
                        }}
                        className={`w-full rounded-xl border-2 p-4 pr-10 text-left transition-colors ${
                          selected
                            ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200'
                            : 'border-[#EDEAE2] hover:border-indigo-200'
                        }`}
                        data-testid={`recreate-mode-${mode}`}
                      >
                        <p className="text-sm font-black text-[#111]">{RECREATE_MODE_COPY[mode].label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#666]">
                          {RECREATE_MODE_COPY[mode].description}
                        </p>
                      </button>
                      <div className="absolute right-2 top-2">
                        <InfoGuide topic={mode === 'closest' ? 'closest' : 'freshTake'} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <RecreateLogoPicker
                value={logoChoice}
                onChange={setLogoChoice}
                disabled={generatingVariants || Boolean(slots)}
              />
              {creditLabel && (
                <p className="flex items-center gap-0.5 text-[11px] text-[#888]" data-testid="recreate-credit-balance">
                  {creditLabel}
                  <InfoGuide topic="renderBalance" />
                </p>
              )}
              <button
                type="button"
                disabled={generatingVariants || !recreateMode || credits?.canRender === false}
                onClick={() => void handleGenerateReference()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-60"
                data-testid="recreate-generate"
              >
                {generatingVariants ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating your versions…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create 3 versions (1 credit)
                  </>
                )}
              </button>
              <p className="flex items-start gap-0.5 text-[11px] leading-relaxed text-[#888]">
                <span>
                  {generatingVariants
                    ? 'This can take a few minutes - keep this tab open until your versions appear.'
                    : 'Create 3 high-quality versions for 1 render credit. Saving one does not use another credit.'}
                </span>
                <InfoGuide topic="createThreeVersions" />
              </p>
            </div>
          </div>
        </>
      )}

      {referenceRecreateEnabled && slots && (
        <div className={COMPOSE_STEP_CARD}>
          <div className="p-4 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <InfoGuideLabel topic="messageAngles" className="text-xs font-black uppercase tracking-widest text-[#666]">
                Your versions
              </InfoGuideLabel>
              <p className="text-[11px] text-[#888]">
                {generatingVariants
                  ? `${readyCount} of 3 ready`
                  : `${readyCount} of 3 ready`}
              </p>
            </div>
            {streamError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                {streamError}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {slots.map((slot) => {
                const selected = slot.variant && selectedVariantId === slot.variant.id
                return (
                  <div
                    key={slot.angle}
                    className={`overflow-hidden rounded-xl border-2 ${
                      selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-[#EDEAE2]'
                    }`}
                    data-testid={`recreate-slot-${slot.angle}`}
                  >
                    {slot.status === 'pending' && (
                      <div className="flex aspect-square items-center justify-center bg-[#F7F5F0]">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      </div>
                    )}
                    {slot.status === 'failed' && (
                      <div className="flex aspect-square items-center justify-center bg-red-50 px-3 text-center text-xs text-red-700">
                        {slot.error || 'This version failed'}
                      </div>
                    )}
                    {slot.status === 'ready' && slot.variant && (
                      <button
                        type="button"
                        onClick={() => selectVariant(slot.variant!)}
                        className="w-full text-left"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slot.variant.imageUrl}
                          alt={RECREATE_MESSAGE_ANGLE_LABELS[slot.angle]}
                          className="aspect-square w-full object-cover"
                        />
                      </button>
                    )}
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <InfoGuideLabel
                        topic={MESSAGE_ANGLE_HELP[slot.angle]}
                        className="text-[11px] font-bold text-[#333]"
                      >
                        {RECREATE_MESSAGE_ANGLE_LABELS[slot.angle]}
                      </InfoGuideLabel>
                      {selected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedVariant && isReferenceResult && !finalImageUrl && (
              <div className="space-y-3">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tuned?.imageUrl || selectedVariant.imageUrl}
                    alt={selectedVariant.label}
                    className="mx-auto max-h-96 rounded-lg border border-[#EDEAE2]"
                  />
                  {updatingVariantId === selectedVariant.id && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/55">
                      <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#555] shadow-sm">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                        Updating logo…
                      </p>
                    </div>
                  )}
                </div>
                <RecreateBrandingControls
                  value={{
                    logoAssetId: selectedVariant.logoDisabled
                      ? null
                      : selectedVariant.logoAssetId ?? logoChoice.logoAssetId,
                    logoVariantType: selectedVariant.logoVariantType ?? null,
                    logoPosition: selectedVariant.logoPosition ?? RECREATE_DEFAULT_LOGO_POSITION,
                    logoSize: selectedVariant.logoSize ?? RECREATE_DEFAULT_LOGO_SIZE,
                  }}
                  disabled={updatingVariantId === selectedVariant.id}
                  onChange={(next) => void applyBrandingToSelected(next)}
                />
                <button
                  type="button"
                  disabled={finalizing}
                  onClick={() => void handleFinalizeVariant()}
                  className="w-full rounded-2xl bg-[#FFD700] py-3.5 text-sm font-black text-black shadow-md hover:bg-yellow-400 disabled:opacity-50"
                  data-testid="recreate-use-this"
                >
                  {finalizing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    'Use this'
                  )}
                </button>
                <button
                  type="button"
                  onClick={startOver}
                  className="w-full text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!referenceRecreateEnabled && variants.length > 0 && !finalImageUrl && (
        <div className={COMPOSE_STEP_CARD}>
          <div className="p-4 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#666]">
              Pick a variant
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {variants.map((variant) => {
                const selected = selectedVariantId === variant.id
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => selectVariant(variant)}
                    className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-[#EDEAE2] hover:border-indigo-200'
                    }`}
                    data-testid={`inspiration-variant-${variant.id}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={variant.imageUrl}
                      alt={variant.label}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <span className="text-[11px] font-bold text-[#333]">{variant.label}</span>
                      {selected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedVariant && tuned && shouldShowRecreateTune(selectedVariant.visualPath) && (
              <RecreateTunePanel
                key={selectedVariant.id}
                business={business}
                variant={selectedVariant}
                tuned={tuned}
                onChange={setTuned}
                onFinalize={() => void handleFinalizeVariant()}
                finalizing={finalizing}
              />
            )}
          </div>
        </div>
      )}

      {finalImageUrl && (
        <div className={`${COMPOSE_STEP_CARD} ring-2 ring-[#FFD700]/35`}>
          <div className="p-4 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-[#666]">
              Final render
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={finalImageUrl}
              alt="Final recreate variant"
              className="mx-auto max-h-80 rounded-lg border border-[#EDEAE2]"
            />
            <p className="text-xs text-[#888]">
              Saved to your Library{finalRenderId ? ` (${finalRenderId.slice(0, 8)}…)` : ''}.
              Download from Library or create another recreate.
            </p>
            <button
              type="button"
              onClick={startOver}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Recreate from another reference
            </button>
          </div>
        </div>
      )}

      {showNoMatchActions && (
        <p className="text-[11px] text-[#888]">
          No match?{' '}
          <button
            type="button"
            onClick={switchToScratch}
            className="font-semibold text-indigo-600 hover:underline"
          >
            Switch to Start from scratch
          </button>
        </p>
      )}
    </div>
  )
}

export type { CarryPhotoPayload }
