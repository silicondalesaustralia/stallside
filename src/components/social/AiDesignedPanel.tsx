'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { appendCampaignFocusStarter } from '@/lib/social/campaignFocusInstructions'
import {
  AI_DESIGNED_INTENT_CHIPS,
  DESIGNED_BRIEF_MAX_CHARS,
  canGenerateDesigned,
  designedBriefOverLimitMessage,
  parseDesignedBrief,
  type AiDesignedIntentId,
} from '@/lib/social/designedIntents'
import { logDesignedAnalytics } from '@/lib/social/designedAnalytics'
import type { DesignedVariantPreview } from '@/lib/social/designedTypes'
import { shouldChargeOnRecreateSave } from '@/lib/social/recreateFinalize'
import {
  RECREATE_MESSAGE_ANGLE_LABELS,
  RECREATE_MESSAGE_ANGLES,
  type RecreateMessageAngle,
} from '@/lib/social/recreateMessageAngles'
import {
  RecreateLogoPicker,
  type RecreateLogoSelection,
} from '@/components/social/RecreateLogoPicker'
import { RecreateBrandingControls } from '@/components/social/RecreateBrandingControls'
import {
  RECREATE_DEFAULT_LOGO_POSITION,
  RECREATE_DEFAULT_LOGO_SIZE,
  socialLogoCornerToRecreatePosition,
  type RecreateLogoPosition,
  type RecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'
import { LogoCornerPicker } from '@/components/social/LogoCornerPicker'
import { parseSocialLogoCorner, type SocialLogoCorner } from '@/lib/social/socialLogoCorner'
import { ImageExpandTrigger } from '@/components/ui/ClickToExpandImage'
import { COMPOSE_STEP_CARD } from '@/lib/social/socialDesignTokens'
import { readNdjsonStream } from '@/lib/social/readNdjsonStream'
import { readApiJson } from '@/lib/http/readApiJson'
import { useToast } from '@/components/ui/Toast'
import { useRenderCredits } from '@/hooks/useRenderCredits'
import type { CreateTabBusiness } from '@/components/social/CreateTab'
import { buildDefaultSceneContent } from '@/lib/social/sceneContent'
import { InfoGuide, InfoGuideLabel } from '@/components/ui/InfoGuide'
import { MESSAGE_ANGLE_HELP } from '@/lib/social/socialHelpContent'
import { TradiesPostCompactLogoPicker } from '@/components/tradiespost/create/TradiesPostCompactLogoPicker'
import {
  DesignedVisualInputs,
  designedVisualsToPayload,
  type DesignedSelectedVisual,
} from '@/components/social/DesignedVisualInputs'
import { DESIGNED_MAX_VISUALS } from '@/lib/social/designedVisualInputs'

export type AiDesignedPresentation = 'default' | 'tradiespost'

const BRIEF_PLACEHOLDER =
  'Promote Victorian Energy Upgrade heating and cooling rebates. Focus on up to $4,000 back, use a premium family-home look, and avoid emergency-service messaging.'

type SlotState = {
  angle: RecreateMessageAngle
  status: 'pending' | 'ready' | 'failed'
  variant: DesignedVariantPreview | null
  error: string | null
}

type CompletedJob = {
  id: string
  title: string
  site_suburb: string | null
  site_state: string | null
  customers?: { first_name: string; last_name: string | null } | null
}

type JobPhotoPreview = {
  id: string
  url: string
  webp_url: string | null
}

function formatDesignedJobLabel(job: CompletedJob): string {
  const customer = [job.customers?.first_name, job.customers?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  const suburb = job.site_suburb?.trim()
  if (customer && suburb) return `${job.title} - ${customer} · ${suburb}`
  if (customer) return `${job.title} - ${customer}`
  if (suburb) return `${job.title} - ${suburb}`
  return job.title
}

function emptySlots(): SlotState[] {
  return RECREATE_MESSAGE_ANGLES.map((angle) => ({
    angle,
    status: 'pending' as const,
    variant: null,
    error: null,
  }))
}

export function AiDesignedPanel({
  business,
  onPostCreated,
  presentation = 'default',
}: {
  business: CreateTabBusiness
  onPostCreated: () => void
  presentation?: AiDesignedPresentation
}) {
  const isTradiesPost = presentation === 'tradiespost'
  const { toast } = useToast()
  const { credits, refresh: refreshCredits } = useRenderCredits()

  const [intentChip, setIntentChip] = useState<AiDesignedIntentId | null>(null)
  const [userBrief, setUserBrief] = useState('')
  const [jobs, setJobs] = useState<CompletedJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobId, setJobId] = useState('')
  const [jobPhotos, setJobPhotos] = useState<JobPhotoPreview[]>([])
  const [jobPhotosLoading, setJobPhotosLoading] = useState(false)
  const [visuals, setVisuals] = useState<DesignedSelectedVisual[]>([])
  const jobSelectRef = useRef<HTMLSelectElement>(null)
  const [logoChoice, setLogoChoice] = useState<RecreateLogoSelection>({
    logoAssetId: undefined,
    logoVariantType: null,
  })
  const [logoCorner, setLogoCorner] = useState<SocialLogoCorner>(() =>
    parseSocialLogoCorner(business.social_logo_corner),
  )
  const [slots, setSlots] = useState<SlotState[] | null>(null)
  const [variants, setVariants] = useState<DesignedVariantPreview[]>([])
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)
  const [finalRenderId, setFinalRenderId] = useState<string | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [updatingVariantId, setUpdatingVariantId] = useState<string | null>(null)
  const generateLockRef = useRef(false)
  const brandingRequestRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    setJobsLoading(true)
    void fetch('/api/social/completed-jobs?scope=recent')
      .then((res) => res.json())
      .then((json: { jobs?: CompletedJob[] }) => {
        if (!cancelled) setJobs(json.jobs ?? [])
      })
      .catch(() => {
        if (!cancelled) setJobs([])
      })
      .finally(() => {
        if (!cancelled) setJobsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!jobId) {
      setJobPhotos([])
      setJobPhotosLoading(false)
      return
    }
    let cancelled = false
    setJobPhotos([])
    setJobPhotosLoading(true)
    void fetch(`/api/social/jobs/${jobId}/photos`)
      .then((res) => res.json())
      .then((json: { photos?: JobPhotoPreview[] }) => {
        if (!cancelled) setJobPhotos(Array.isArray(json.photos) ? json.photos : [])
      })
      .catch(() => {
        if (!cancelled) setJobPhotos([])
      })
      .finally(() => {
        if (!cancelled) setJobPhotosLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [jobId])

  useEffect(() => {
    setVisuals((prev) => {
      const next = prev.filter((item) => item.source !== 'job_photo' || item.jobId === jobId)
      return next.length === prev.length ? prev : next
    })
  }, [jobId])

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null
  const readyCount = slots?.filter((s) => s.status === 'ready').length ?? 0
  const canGenerate = canGenerateDesigned({ userBrief, intentChip })
  const briefParse = parseDesignedBrief(userBrief)
  const briefOverLimit = !briefParse.ok
  const briefOverLimitCopy = designedBriefOverLimitMessage(userBrief)

  const creditLabel = credits
    ? credits.canRender
      ? credits.creditsRemaining > 0
        ? `${credits.creditsRemaining} render credit${credits.creditsRemaining === 1 ? '' : 's'} left`
        : '1 free trial render available'
      : 'No render credits left'
    : null

  function toggleChip(id: AiDesignedIntentId) {
    if (generating) return
    const chip = AI_DESIGNED_INTENT_CHIPS.find((row) => row.id === id)
    if (!chip) return
    if (intentChip === id) {
      setIntentChip(null)
      return
    }
    setIntentChip(id)
    setUserBrief((prev) => {
      if (prev.trim()) return prev
      return appendCampaignFocusStarter(prev, chip.starter, DESIGNED_BRIEF_MAX_CHARS)
    })
  }

  const selectVariant = useCallback((variant: DesignedVariantPreview) => {
    setSelectedVariantId(variant.id)
    logDesignedAnalytics('ai_designed_variant_selected', {
      messageAngle: variant.messageAngle,
      hadUserBrief: Boolean(variant.userBrief),
      intentChip: variant.intentChip ?? null,
      logoVariantType: variant.logoVariantType,
      logoPosition: variant.logoPosition,
      logoSize: variant.logoSize,
      logoDisabled: variant.logoDisabled === true,
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (generateLockRef.current) return
    const parsed = parseDesignedBrief(userBrief)
    if (!parsed.ok) {
      toast(parsed.error, 'error')
      return
    }
    if (!canGenerateDesigned({ userBrief, intentChip })) {
      toast('Add a brief or choose at least one focus chip', 'error')
      return
    }
    generateLockRef.current = true
    setGenerating(true)
    setVariants([])
    setSlots(emptySlots())
    setSelectedVariantId(null)
    setFinalImageUrl(null)
    setFinalRenderId(null)
    setStreamError(null)

    const generationId = crypto.randomUUID()
    const nextVariants: DesignedVariantPreview[] = []

    try {
      const res = await fetch('/api/social/designed-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userBrief: userBrief.trim() || null,
          intentChip,
          jobId: jobId || null,
          generationId,
          showLogo: logoChoice.logoAssetId !== null,
          logoAssetId:
            logoChoice.logoAssetId === undefined ? undefined : logoChoice.logoAssetId,
          logoPosition: socialLogoCornerToRecreatePosition(logoCorner),
          visualInputs: designedVisualsToPayload(visuals),
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
        if (event.type === 'variant' && event.variant && typeof event.index === 'number') {
          const variant = event.variant as DesignedVariantPreview
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
        if (event.type === 'variant_failed' && typeof event.index === 'number') {
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
        if (event.type === 'error') {
          const refunded = event.creditRefunded === true
          const message =
            (typeof event.error === 'string' && event.error) || 'Could not create versions'
          setStreamError(refunded ? `${message} Your credit was returned.` : message)
        }
      })

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
      setGenerating(false)
    }
  }, [userBrief, intentChip, jobId, logoChoice, logoCorner, visuals, toast, refreshCredits])

  async function persistLibraryCaption(renderId: string) {
    try {
      const res = await fetch('/api/social/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renderId,
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

  const handleUseThis = useCallback(async () => {
    if (!selectedVariant) return
    setFinalizing(true)
    try {
      const prepaid = !shouldChargeOnRecreateSave(selectedVariant.visualPath)
      const content = buildDefaultSceneContent({
        name: business.name,
        phone: business.phone,
        ai_agent_services: business.ai_agent_services,
        social_default_cta: business.social_default_cta,
      })
      const res = await fetch('/api/social/hybrid-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'scene',
          platform: 'instagram',
          photoSource: 'none',
          photoUrl: selectedVariant.imageUrl,
          content,
          showLogo: false,
          passThroughVisual: prepaid,
          designedMeta: {
            messageAngle: selectedVariant.messageAngle,
            userBrief: selectedVariant.userBrief,
            intentChip: selectedVariant.intentChip,
            jobId: selectedVariant.jobId,
            visualPath: 'ai_designed',
            imageModel: selectedVariant.imageModel,
            logoAssetId: selectedVariant.logoAssetId,
            logoVariantType: selectedVariant.logoVariantType,
            logoDisabled: selectedVariant.logoDisabled === true,
            logoPosition: selectedVariant.logoPosition,
            logoSize: selectedVariant.logoSize,
            visualInputs: selectedVariant.visualInputs ?? designedVisualsToPayload(visuals),
          },
        }),
      })
      const json = await readApiJson<{
        imageUrl?: string
        resultUrl?: string
        id?: string
        error?: string
        code?: string
      }>(res)
      if (!res.ok) {
        throw new Error(json.error || 'Save failed')
      }
      setFinalImageUrl(json.imageUrl || json.resultUrl || null)
      setFinalRenderId(json.id ?? null)
      if (json.id) void persistLibraryCaption(json.id)
      await refreshCredits()
      toast('Saved to Library', 'success')
      onPostCreated()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setFinalizing(false)
    }
  }, [selectedVariant, business, refreshCredits, toast, onPostCreated, visuals])

  async function applyBrandingToSelected(next: {
    logoAssetId: string | null | undefined
    logoVariantType: string | null
    logoPosition: RecreateLogoPosition
    logoSize: RecreateLogoSize
  }) {
    const target = selectedVariant
    if (!target?.baseStoragePath || generating) return
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

  const chipSelectedClass = isTradiesPost
    ? 'border-[#F5C518] bg-[#FFFBEB] text-[#18181B]'
    : 'border-indigo-500 bg-indigo-50 text-indigo-800'
  const chipDefaultClass = isTradiesPost
    ? 'border-zinc-200 bg-white text-zinc-600 hover:border-[#F5C518]/50'
    : 'border-[#EDEAE2] bg-[#FAFAF8] text-[#555] hover:border-indigo-200'

  const chipsSection = (
    <div className={COMPOSE_STEP_CARD}>
      <div className="space-y-3 p-4">
        {isTradiesPost ? (
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">3 · Choose the type</p>
        ) : null}
        <InfoGuideLabel topic="postType" className="text-sm font-black text-[#111]">
          {isTradiesPost ? 'Suggested post types' : 'What kind of post?'}
        </InfoGuideLabel>
        <p className="text-[11px] text-[#888]">Optional - pick a focus or just write your brief.</p>
        <div className="flex flex-wrap gap-1.5" data-testid="ai-designed-intent-chips">
          {AI_DESIGNED_INTENT_CHIPS.map((chip) => {
            const selected = intentChip === chip.id
            return (
              <span key={chip.id} className="inline-flex items-center">
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => toggleChip(chip.id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    selected ? chipSelectedClass : chipDefaultClass
                  }`}
                  data-testid={`ai-designed-chip-${chip.id}`}
                >
                  {chip.label}
                </button>
                {chip.id === 'trust_proof' ? <InfoGuide topic="trustProofChip" /> : null}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )

  const briefSection = (
    <div className={COMPOSE_STEP_CARD}>
      <div className="space-y-2 p-4">
        {isTradiesPost ? (
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
            2 · Give Vendl the content
          </p>
        ) : null}
        <label htmlFor="ai-designed-brief" className="flex items-center gap-0.5 text-sm font-black text-[#111]">
          {isTradiesPost ? 'What do you want to promote?' : 'What should this post be about?'}
          <InfoGuide topic="brief" />
        </label>
        <p className="text-[11px] leading-relaxed text-[#888]">
          {isTradiesPost
            ? 'Tell us the service, offer, job or message you want customers to see.'
            : 'Tell us the service, offer, job, message or audience you want to focus on.'}
        </p>
          <textarea
            id="ai-designed-brief"
            value={userBrief}
            rows={4}
            disabled={generating}
            onChange={(e) => setUserBrief(e.target.value)}
            className={`min-h-[120px] w-full resize-y rounded-lg border px-3 py-2 text-sm leading-relaxed ${
              briefOverLimitCopy ? 'border-red-400' : 'border-[#E0DDD5]'
            }`}
            placeholder={BRIEF_PLACEHOLDER}
            data-testid="ai-designed-brief"
            aria-invalid={Boolean(briefOverLimitCopy)}
          />
          <div
            className={`flex items-start justify-between gap-3 text-[11px] ${
              briefOverLimitCopy ? 'text-red-600' : 'text-[#888]'
            }`}
          >
            <p data-testid="ai-designed-brief-hint">
              {briefOverLimitCopy ??
                'Optional if you picked a chip - more detail usually looks better'}
            </p>
            <p className="shrink-0 tabular-nums" data-testid="ai-designed-brief-count">
              {userBrief.length.toLocaleString('en-AU')} / {DESIGNED_BRIEF_MAX_CHARS.toLocaleString('en-AU')}
            </p>
          </div>
      </div>
    </div>
  )

  const visualsSection = (
    <DesignedVisualInputs
      visuals={visuals}
      onChange={setVisuals}
      disabled={generating}
      jobId={jobId}
      onRequestJobPhotos={() => {
        jobSelectRef.current?.focus()
        jobSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }}
    />
  )

  function toggleJobPhoto(photo: JobPhotoPreview) {
    if (generating) return
    const existing = visuals.find((item) => item.source === 'job_photo' && item.photoId === photo.id)
    if (existing) {
      setVisuals(visuals.filter((item) => item.clientId !== existing.clientId))
      return
    }
    if (visuals.length >= DESIGNED_MAX_VISUALS) {
      toast(`You can add up to ${DESIGNED_MAX_VISUALS} visuals.`, 'error')
      return
    }
    const preview = photo.webp_url || photo.url
    setVisuals([
      ...visuals,
      {
        clientId: crypto.randomUUID(),
        source: 'job_photo',
        role: 'include',
        isPrimary: false,
        jobId,
        photoId: photo.id,
        previewUrl: preview,
        title: 'Product photo',
      },
    ])
  }

  const jobSection = (
    <div className={COMPOSE_STEP_CARD}>
      <div className="space-y-2 p-4">
        <label htmlFor="ai-designed-job" className="text-sm font-black text-[#111]">
          Use a product or offer
        </label>
          <p className="text-[11px] text-[#888]">
            Optional — we still use the product name and details. Choose which photos to include
            below.
          </p>
          <select
            id="ai-designed-job"
            ref={jobSelectRef}
            value={jobId}
            disabled={generating || jobsLoading}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-sm"
            data-testid="ai-designed-job"
          >
            <option value="">{jobsLoading ? 'Loading jobs…' : 'No job selected'}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {formatDesignedJobLabel(job)}
              </option>
            ))}
          </select>
          {jobId && jobPhotosLoading && (
            <p className="flex items-center gap-2 text-[11px] text-[#888]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading photos…
            </p>
          )}
          {jobId && !jobPhotosLoading && jobPhotos.length === 0 && (
            <p className="text-[11px] text-[#888]" data-testid="ai-designed-job-photos-empty">
              No photos on this item yet
            </p>
          )}
          {jobPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#444]">Use photos from this item</p>
              <p className="text-[11px] text-[#888]">Select one or more. Nothing is added automatically.</p>
              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                data-testid="ai-designed-job-photos"
              >
                {jobPhotos.map((photo) => {
                  const src = photo.webp_url || photo.url
                  const selected = visuals.some(
                    (item) => item.source === 'job_photo' && item.photoId === photo.id,
                  )
                  return (
                    <div key={photo.id} className="group relative">
                      <button
                        type="button"
                        disabled={generating}
                        aria-pressed={selected}
                        onClick={() => toggleJobPhoto(photo)}
                        className={`aspect-square w-full overflow-hidden rounded-lg bg-[#F4F1EA] ring-2 ${
                          selected ? 'ring-indigo-500' : 'ring-transparent'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="Product photo" className="h-full w-full object-cover" />
                      </button>
                      <ImageExpandTrigger src={src} alt="Product photo" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
  )

  const generateButton = (
    <>
      <button
        type="button"
        disabled={generating || !canGenerate || briefOverLimit || credits?.canRender === false}
        onClick={() => void handleGenerate()}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black disabled:opacity-60 ${
          isTradiesPost
            ? 'bg-[#F5C518] text-[#18181B] shadow-md hover:bg-[#E5B516]'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
        data-testid="ai-designed-generate"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating your versions…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {isTradiesPost ? 'Create 3 versions · 1 render' : 'Create 3 versions (1 credit)'}
          </>
        )}
      </button>
      <p className="flex items-start gap-0.5 text-[11px] leading-relaxed text-[#888]">
        <span>
          {generating
            ? 'This can take a few minutes - keep this tab open until your versions appear.'
            : isTradiesPost
              ? '3 complete designs generated. Saving does not use another render.'
              : 'Create 3 complete designs for 1 render credit. Saving one does not use another credit.'}
        </span>
        <InfoGuide topic="createThreeVersions" />
      </p>
    </>
  )

  const brandCtaSection = (
    <div
      className={`${COMPOSE_STEP_CARD} ${isTradiesPost ? 'sm:sticky sm:bottom-4 sm:z-10' : ''}`}
    >
      <div className="space-y-3 p-4">
        {isTradiesPost ? (
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">4 · Brand</p>
        ) : (
          <p className="text-sm font-black text-[#111]">Logo</p>
        )}
        {isTradiesPost ? (
          <TradiesPostCompactLogoPicker
            value={logoChoice}
            onChange={setLogoChoice}
            disabled={generating || Boolean(slots)}
          />
        ) : (
          <RecreateLogoPicker
            value={logoChoice}
            onChange={setLogoChoice}
            disabled={generating || Boolean(slots)}
          />
        )}
        {logoChoice.logoAssetId !== null && (
          <div>
            <p className="mb-2 text-xs font-semibold text-[#666]">Logo position (this post)</p>
            <LogoCornerPicker
              value={logoCorner}
              onChange={setLogoCorner}
              disabled={generating || Boolean(slots)}
            />
            <p className="mt-1.5 text-[10px] text-[#AAA]">
              Override for this post — default is in Post defaults above.
            </p>
          </div>
        )}
        {creditLabel && (
          <p className="flex items-center gap-0.5 text-[11px] text-[#888]" data-testid="ai-designed-credit-balance">
            {creditLabel}
            <InfoGuide topic="renderBalance" />
          </p>
        )}
        {generateButton}
      </div>
    </div>
  )

  return (
    <div className="space-y-4" data-testid="ai-designed-panel">
      {isTradiesPost ? (
        <>
          {briefSection}
          {chipsSection}
          {visualsSection}
          {jobSection}
          {brandCtaSection}
        </>
      ) : (
        <>
          {chipsSection}
          {briefSection}
          {visualsSection}
          {jobSection}
          {brandCtaSection}
        </>
      )}

      {slots && (
        <div className={COMPOSE_STEP_CARD}>
          <div className="space-y-4 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <InfoGuideLabel topic="messageAngles" className="text-xs font-black uppercase tracking-widest text-[#666]">
                Your versions
              </InfoGuideLabel>
              <p className="text-[11px] text-[#888]" data-testid="ai-designed-ready-count">
                {readyCount} of 3 ready
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
                    data-testid={`ai-designed-slot-${slot.angle}`}
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

            {selectedVariant && !finalImageUrl && (
              <div className="space-y-3">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedVariant.imageUrl}
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
                  onClick={() => void handleUseThis()}
                  className="w-full rounded-2xl bg-[#FFD700] py-3.5 text-sm font-black text-black shadow-md hover:bg-yellow-400 disabled:opacity-50"
                  data-testid="ai-designed-use-this"
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
              </div>
            )}
          </div>
        </div>
      )}

      {finalImageUrl && (
        <div className={`${COMPOSE_STEP_CARD} ring-2 ring-[#FFD700]/35`}>
          <div className="space-y-3 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#666]">Saved</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={finalImageUrl}
              alt="Saved AI Designed post"
              className="mx-auto max-h-80 rounded-lg border border-[#EDEAE2]"
            />
            <p className="text-xs text-[#888]">
              Saved to your Library{finalRenderId ? ` (${finalRenderId.slice(0, 8)}…)` : ''}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
