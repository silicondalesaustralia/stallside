'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Camera, CheckCircle, Copy, Download, Loader2, RotateCcw, Sparkles, Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { formatDateShort } from '@/lib/utils/format'
import {
  defaultSubtypeForCategory,
  getPostSubtypeDefinition,
  isPostCategoryId,
  isPostSubtypeId,
  type PostCategoryId,
  type PostSubtypeId,
} from '@/lib/social/postTaxonomy'
import { composeOccasionFromBusinessPrefs } from '@/lib/social/composeOccasionInitial'
import { aiPurposeForSubtype } from '@/lib/social/composeAiPurpose'
import { sceneContentFromSocialDraft } from '@/lib/agent/sceneContentFromSocialDraft'
import { resolveSocialDraftRenderPlan } from '@/lib/agent/socialDraftDefaults'
import type { SocialDraftContent } from '@/lib/agent/types'
import {
  estimateComposeCreditsTotal,
  formatComposeGenerateStepCreditLine,
  formatComposeTotalCreditLine,
  formatPhotoSourceCreditHint,
} from '@/lib/social/composeCreditEstimate'
import { ComposeOccasionPicker } from '@/components/social/ComposeOccasionPicker'

function maybeOfferTradiesPostRenderPurchase(code: string | undefined, message: string): boolean {
  if (code !== 'no_render_credits' && code !== 'insufficient_usage_balance') return false
  if (typeof window === 'undefined') return false
  if (!window.location.hostname.includes('tradiespost')) return false
  const go = window.confirm(
    `${message}\n\nYou’re out of renders. Open Billing & Credits to buy a pack?`,
  )
  if (go) window.location.href = '/billing?buy=1'
  return true
}
import { LogoCornerPicker } from '@/components/social/LogoCornerPicker'
import { SceneStackLayoutPicker } from '@/components/social/SceneStackLayoutPicker'
import { SocialTextStyleEditor } from '@/components/social/SocialTextStyleEditor'
import { SceneContentFields } from '@/components/social/SceneContentFields'
import {
  QuoteCardContentFields,
  type QuoteCardFormContent,
} from '@/components/social/QuoteCardContentFields'
import { PhotoFieldPicker } from '@/components/social/PhotoFieldPicker'
import { ComposePreviewPanel } from '@/components/social/ComposePreviewPanel'
import { useRenderCredits } from '@/hooks/useRenderCredits'
import { ComposeAxesPanel } from '@/components/social/ComposeAxesPanel'
import {
  isCanonicalHttpsPhotoUrl,
  mapComposeUploadFailure,
  uploadInspirationTempFile,
} from '@/lib/social/uploadInspirationTempFile'
import type { CarryPhotoPayload } from '@/components/social/RecreateTab'
import { BuildMyWeekPlannerBanner } from '@/components/social/BuildMyWeekPlannerBanner'
import { SocialCreationModeSelector } from '@/components/social/SocialCreationModeSelector'
import { SocialManualPostGuide } from '@/components/social/SocialManualPostGuide'
import {
  DEFAULT_SOCIAL_CREATION_MODE,
  type SocialCreationMode,
} from '@/lib/social/socialCreateModes'
import {
  defaultScratchCreateMode,
  resolveScratchCreateSurface,
  type ScratchCreateMode,
} from '@/lib/social/aiDesignedConfig'

function CreateSubFlowSkeleton() {
  return (
    <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-[#EDEAE2] bg-[#FAFAF8]">
      <Loader2 className="h-8 w-8 animate-spin text-[#F5C518]" aria-label="Loading create flow" />
    </div>
  )
}

const RecreateTab = dynamic(
  () => import('@/components/social/RecreateTab').then((m) => ({ default: m.RecreateTab })),
  { loading: () => <CreateSubFlowSkeleton /> },
)
const AiDesignedPanel = dynamic(
  () => import('@/components/social/AiDesignedPanel').then((m) => ({ default: m.AiDesignedPanel })),
  { loading: () => <CreateSubFlowSkeleton /> },
)
const CreateVideoWorkspace = dynamic(
  () =>
    import('@/components/social/CreateVideoWorkspace').then((m) => ({
      default: m.CreateVideoWorkspace,
    })),
  { loading: () => <CreateSubFlowSkeleton /> },
)
import { InfoGuide } from '@/components/ui/InfoGuide'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { SocialComingSoonPlatform } from '@/lib/social/platformComingSoonContent'
import {
  COMPOSE_STEP_CARD,
  COMPOSE_STEP_HEADER,
  FORMAT_ACCENTS,
  PLATFORM_PREVIEW_THEMES,
} from '@/lib/social/socialDesignTokens'
import { fetchInfographicContent } from '@/lib/social/fetchInfographicContent'
import {
  parseSocialLogoCorner,
  type SocialLogoCorner,
} from '@/lib/social/socialLogoCorner'
import {
  stackLayoutFromStyles,
  type SceneStackLayout,
} from '@/lib/social/sceneStackLayout'
import {
  parseSocialTextStyles,
  styleBold,
  styleItalic,
  styleUnderline,
  type PartialSocialTextStyles,
  type SocialElementStyle,
  type SocialTextElement,
  type SocialTextStyles,
} from '@/lib/social/socialTextStyle'
import {
  resolveJobDescription,
} from '@/lib/social/templateFields'
import {
  inferTradeCategory,
} from '@/lib/social/inferTradeCategory'
import {
  buildDefaultSceneContent,
  type SceneContent,
} from '@/lib/social/sceneContent'
import { buildEmptyQuoteCardContent } from '@/lib/social/quoteCardContent'
import {
  composeDefaultsForSubtype,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'
import type { InfographicContent } from '@/lib/social/infographicContent'
import { useSocialProductVariant } from '@/components/tradiespost/SocialProductVariant'
import {
  TradiesPostCreateRouteSelector,
  type TradiesPostCreateRoute,
} from '@/components/tradiespost/create/TradiesPostCreateRouteSelector'
import { TradiesPostBuildMyWeekLink } from '@/components/tradiespost/create/TradiesPostBuildMyWeekLink'
import { TradiesPostRecreateIntro } from '@/components/tradiespost/create/TradiesPostRecreateIntro'
import {
  TradiesPostBackToCreateOptions,
} from '@/components/tradiespost/create/TradiesPostBackToCreateOptions'
import { TRADIESPOST_CREATE_RESET_EVENT } from '@/lib/tradiespost/createNavigation'

const COMPOSE_TABS = [
  { id: 'scratch', label: 'Start from scratch' },
  { id: 'recreate', label: 'Recreate' },
] as const

type ComposeTabId = (typeof COMPOSE_TABS)[number]['id']

const VALID_COMPOSE_TAB_IDS = new Set<string>(COMPOSE_TABS.map((t) => t.id))

function tpCreateStartsInSubFlow(
  initialJobId?: string | null,
  agentSuggestionId?: string | null,
  initialComposeStep?: string | null,
): boolean {
  if (initialJobId?.trim()) return true
  if (agentSuggestionId?.trim()) return true
  if (initialComposeStep?.trim()) return true
  return false
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateTabBusiness {
  id: string
  name: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
  ai_agent_services: string | null
  facebook_page_id: string | null
  facebook_page_name: string | null
  instagram_account_id: string | null
  instagram_username: string | null
  gmb_account_id: string | null
  gmb_location_name: string | null
  social_brand_voice: string | null
  social_default_cta: string | null
  social_text_styles: SocialTextStyles | null
  brand_color: string | null
  social_logo_corner?: string | null
  social_compose_last_category?: string | null
  social_compose_last_subtype?: string | null
}

interface Job {
  id: string
  title: string
  site_suburb: string | null
  site_state: string | null
  created_at: string
  customers: { first_name: string; last_name: string | null } | null
}

interface JobPhoto {
  id: string
  url: string
  webp_url: string | null
}

type PostPlatform = 'instagram' | 'facebook' | 'gmb'

const CHAR_LIMITS: Record<PostPlatform, number> = {
  instagram: 2200,
  facebook:  63206,
  gmb:       1500,
}

function descriptionFallback(
  postSubtype: PostSubtypeId,
  services: string | null,
): string | null {
  const fromTaxonomy = getPostSubtypeDefinition(postSubtype).descriptionFallback
  if (fromTaxonomy?.trim()) return fromTaxonomy
  return services
}

function formatJobLabel(job: Job): string {
  const suburb = job.site_suburb?.trim()
  const date = formatDateShort(job.created_at)
  return suburb ? `${job.title} · ${suburb} · ${date}` : `${job.title} · ${date}`
}

function StepHeader({
  n,
  title,
  accentDot,
}: {
  n: number
  title: string
  accentDot?: string
}) {
  return (
    <div className={COMPOSE_STEP_HEADER}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#111] text-[10px] font-black text-white shadow-sm">
          {n}
        </span>
        {accentDot ? (
          <span className={`h-2 w-2 shrink-0 rounded-full ${accentDot}`} aria-hidden />
        ) : null}
        <p className="text-xs font-black uppercase tracking-widest text-[#666]">{title}</p>
      </div>
    </div>
  )
}

function defaultSelectedPlatforms(
  connected: Record<PostPlatform, boolean>,
): PostPlatform[] {
  const platforms: PostPlatform[] = []
  if (connected.instagram) platforms.push('instagram')
  if (connected.facebook) platforms.push('facebook')
  if (connected.gmb) platforms.push('gmb')
  return platforms
}

function PlatformToggle({
  label, connected, selected, onToggle, platform,
}: {
  label: string
  connected: boolean
  selected: boolean
  onToggle: () => void
  platform: PostPlatform
}) {
  const theme = PLATFORM_PREVIEW_THEMES[platform]
  return (
    <label
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${
        !connected
          ? 'cursor-not-allowed border-[#EDEAE2] bg-[#FAFAF7] opacity-60'
          : selected
            ? `cursor-pointer border-transparent bg-gradient-to-r ${theme.cornerGradient} text-white shadow-md scale-[1.01]`
            : 'cursor-pointer border-[#EDEAE2] bg-white hover:border-[#DDD] hover:shadow-sm'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={!connected}
        onChange={() => connected && onToggle()}
        className="accent-[#FFD700] disabled:cursor-not-allowed"
      />
      <span className={`text-sm font-semibold ${connected ? (selected ? 'text-white' : 'text-[#333]') : 'text-[#AAA]'}`}>
        {label}
      </span>
      {!connected && (
        <span className="ml-auto text-[10px] font-semibold text-[#BBB]">Not connected</span>
      )}
    </label>
  )
}

// ── Create Tab ────────────────────────────────────────────────────────────────

export function CreateTab({
  business,
  initialJobId,
  agentSuggestionId,
  initialComposeStep,
  infographicAiBackgroundEnabled = false,
  aiDesignedEnabled = false,
  onPostCreated,
  onViewLibrary,
  onComposePrefsUpdate,
}: {
  business: CreateTabBusiness
  initialJobId?: string | null
  agentSuggestionId?: string | null
  initialComposeStep?: string | null
  /** Server env INFOGRAPHIC_AI_BACKGROUND_ENABLED - gates Step 2 toggle. */
  infographicAiBackgroundEnabled?: boolean
  /** From /api/social/context - avoids flashing the old builder on refresh. */
  aiDesignedEnabled?: boolean
  onPostCreated: () => void
  onViewLibrary?: () => void
  onComposePrefsUpdate?: (
    patch: Pick<
      CreateTabBusiness,
      'social_compose_last_category' | 'social_compose_last_subtype'
    >,
  ) => void
}) {
  const { toast } = useToast()
  const initialJobHandled = useRef(false)
  const weekAheadPrefillHandled = useRef(false)
  const weekAheadCaptionLocked = useRef(false)
  const composeStep2Ref = useRef<HTMLDivElement>(null)
  const [linkedAgentSuggestionId, setLinkedAgentSuggestionId] = useState(
    () => agentSuggestionId?.trim() || '',
  )
  const [defaultAiBackground, setDefaultAiBackground] = useState<{
    purpose: string
    sceneId: string
    style: string
  } | null>(null)
  const { credits: renderCredits, loading: renderCreditsLoading, refresh: refreshRenderCredits } =
    useRenderCredits()
  const [creditsPulseKey, setCreditsPulseKey] = useState(0)

  const refreshCreditsWithPulse = useCallback(async () => {
    await refreshRenderCredits()
    setCreditsPulseKey((k) => k + 1)
  }, [refreshRenderCredits])

  const initialOccasion = composeOccasionFromBusinessPrefs(
    business.social_compose_last_category,
    business.social_compose_last_subtype,
  )

  const [postCategory, setPostCategory] = useState<PostCategoryId>(initialOccasion.categoryId)
  const [postSubtype, setPostSubtype] = useState<PostSubtypeId>(initialOccasion.subtypeId)

  const [contentFormat, setContentFormat] = useState<ContentFormat>(
    () => composeDefaultsForSubtype(initialOccasion.subtypeId).format,
  )
  const [photoSource, setPhotoSource] = useState<PhotoSource>(
    () => composeDefaultsForSubtype(initialOccasion.subtypeId).photoSource,
  )
  const [infographicPreset, setInfographicPreset] = useState<InfographicPreset>(
    () => composeDefaultsForSubtype(initialOccasion.subtypeId).infographicPreset,
  )
  /** Populated via fetchInfographicContent before hybrid-render. */
  const [infographicContent, setInfographicContent] = useState<InfographicContent | null>(null)
  const [infographicContentLoading, setInfographicContentLoading] = useState(false)
  const [composeTab, setComposeTab] = useState<ComposeTabId>('scratch')
  const [creationMode, setCreationMode] = useState<SocialCreationMode>(
    DEFAULT_SOCIAL_CREATION_MODE,
  )
  const [scratchCreateMode, setScratchCreateMode] = useState<ScratchCreateMode>(
    defaultScratchCreateMode(),
  )
  const [tpCreateAtSelector, setTpCreateAtSelector] = useState(
    () => !tpCreateStartsInSubFlow(initialJobId, agentSuggestionId, initialComposeStep),
  )
  const [composePhotoUrl, setComposePhotoUrl] = useState('')
  const [composePhotoHttpsUrl, setComposePhotoHttpsUrl] = useState('')
  const [composePhotoStoragePath, setComposePhotoStoragePath] = useState('')
  const [sceneContent, setSceneContent] = useState<SceneContent>(() =>
    buildDefaultSceneContent({
      name: business.name,
      phone: business.phone,
      ai_agent_services: business.ai_agent_services,
      social_default_cta: business.social_default_cta,
    }),
  )
  const [quoteCardContent, setQuoteCardContent] = useState<QuoteCardFormContent>(
    () => buildEmptyQuoteCardContent(),
  )
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [jobPhotos, setJobPhotos] = useState<JobPhoto[]>([])
  const [photosLoading, setPhotosLoading] = useState(false)

  const [uploadingPhotoKey, setUploadingPhotoKey] = useState<string | null>(null)
  const [aiPhotoSessionKey, setAiPhotoSessionKey] = useState(0)
  const [aiPhotoCreditSpent, setAiPhotoCreditSpent] = useState(false)
  const [photoCleanupApplied, setPhotoCleanupApplied] = useState(false)
  const [aiDesignedBackground, setAiDesignedBackground] = useState(false)
  const [logoCorner, setLogoCorner] = useState<SocialLogoCorner>(() =>
    parseSocialLogoCorner(business.social_logo_corner),
  )

  const businessTextStylesBaseline = useMemo(
    () => parseSocialTextStyles(business.social_text_styles),
    [business.social_text_styles],
  )

  const scratchSurface = useMemo(
    () => resolveScratchCreateSurface(aiDesignedEnabled, scratchCreateMode),
    [aiDesignedEnabled, scratchCreateMode],
  )

  const [textStyles, setTextStyles] = useState<SocialTextStyles>(() => businessTextStylesBaseline)
  const [textStyleOverrides, setTextStyleOverrides] = useState<PartialSocialTextStyles>({})

  useEffect(() => {
    setTextStyles(businessTextStylesBaseline)
    setTextStyleOverrides({})
  }, [businessTextStylesBaseline])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const compose = params.get('compose')
    if (compose && VALID_COMPOSE_TAB_IDS.has(compose)) {
      setComposeTab(compose as ComposeTabId)
      setTpCreateAtSelector(false)
    }
  }, [])

  const isTradiesPost = useSocialProductVariant() === 'tradiespost'

  useEffect(() => {
    if (!isTradiesPost) return
    const onReset = () => {
      setTpCreateAtSelector(true)
      setCreationMode(DEFAULT_SOCIAL_CREATION_MODE)
    }
    window.addEventListener(TRADIESPOST_CREATE_RESET_EVENT, onReset)
    return () => window.removeEventListener(TRADIESPOST_CREATE_RESET_EVENT, onReset)
  }, [isTradiesPost])

  function handleComposeTabChange(nextTab: ComposeTabId) {
    setComposeTab(nextTab)
    const url = new URL(window.location.href)
    url.searchParams.set('compose', nextTab)
    window.history.replaceState({}, '', url.toString())
  }

  const tpCreateRoute: TradiesPostCreateRoute =
    composeTab === 'recreate'
      ? 'inspiration'
      : scratchCreateMode === 'ai_designed'
        ? 'idea'
        : 'photos'

  function backToCreateOptions() {
    setTpCreateAtSelector(true)
    setCreationMode(DEFAULT_SOCIAL_CREATION_MODE)
  }

  function enterTpCreateFlow(route: TradiesPostCreateRoute) {
    handleTpCreateRouteChange(route)
    setTpCreateAtSelector(false)
  }

  function handleTpCreationModeChange(mode: SocialCreationMode) {
    setCreationMode(mode)
    setTpCreateAtSelector(false)
  }

  function handleTpCreateRouteChange(route: TradiesPostCreateRoute) {
    if (route === 'inspiration') {
      handleComposeTabChange('recreate')
      return
    }
    handleComposeTabChange('scratch')
    setScratchCreateMode(route === 'idea' ? 'ai_designed' : 'build_layout')
  }

  async function carryPhotoToScratch(carryPhoto?: CarryPhotoPayload) {
    handleComposeTabChange('scratch')
    setScratchCreateMode('build_layout')
    setTpCreateAtSelector(false)
    if (!carryPhoto) return

    try {
      const blob = await fetch(`data:${carryPhoto.mimeType};base64,${carryPhoto.base64}`).then(
        (r) => r.blob(),
      )
      const ext = carryPhoto.mimeType.includes('png')
        ? 'png'
        : carryPhoto.mimeType.includes('webp')
          ? 'webp'
          : 'jpg'
      const file = new File([blob], `inspiration-carry.${ext}`, { type: carryPhoto.mimeType })
      const uploaded = await uploadInspirationTempFile(file)
      setComposePhotoStoragePath(uploaded.path)
      setComposePhotoUrl(uploaded.previewUrl)
      setComposePhotoHttpsUrl(uploaded.httpsUrl)
      setPhotoSource('upload')
      toast('Screenshot carried over - finish your post in Start from scratch', 'success')
      window.setTimeout(() => {
        composeStep2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch {
      toast('Could not carry photo over - upload again in Start from scratch', 'error')
    }
  }

  function diffElementOverride(
    element: SocialTextElement,
    next: SocialElementStyle,
  ): Partial<SocialElementStyle> | null {
    const base = businessTextStylesBaseline[element]
    const patch: Partial<SocialElementStyle> = {}
    if (next.fontFamily !== base.fontFamily) patch.fontFamily = next.fontFamily
    if (next.fontSize !== base.fontSize) patch.fontSize = next.fontSize
    if (next.color !== base.color) patch.color = next.color
    if (styleBold(next, element) !== styleBold(base, element)) {
      patch.bold = styleBold(next, element)
    }
    if (styleItalic(next) !== styleItalic(base)) patch.italic = styleItalic(next)
    if (styleUnderline(next) !== styleUnderline(base)) {
      patch.underline = styleUnderline(next)
    }
    return Object.keys(patch).length > 0 ? patch : null
  }

  function handleStackLayoutChange(next: SceneStackLayout) {
    setTextStyles((prev) => ({ ...prev, ...next }))
    setTextStyleOverrides((prev) => {
      const base = stackLayoutFromStyles(businessTextStylesBaseline)
      const patch: PartialSocialTextStyles = { ...prev }
      if (next.stackAnchor !== base.stackAnchor) patch.stackAnchor = next.stackAnchor
      else delete patch.stackAnchor
      if (next.stackOffsetX !== base.stackOffsetX) patch.stackOffsetX = next.stackOffsetX
      else delete patch.stackOffsetX
      if (next.stackOffsetY !== base.stackOffsetY) patch.stackOffsetY = next.stackOffsetY
      else delete patch.stackOffsetY
      return patch
    })
  }

  function handleTextStyleChange(element: SocialTextElement, next: SocialElementStyle) {
    setTextStyles((prev) => ({ ...prev, [element]: next }))
    setTextStyleOverrides((prev) => {
      const patch = diffElementOverride(element, next)
      if (!patch) {
        const { [element]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [element]: patch }
    })
  }

  const connected: Record<PostPlatform, boolean> = {
    instagram: !!business.instagram_account_id,
    facebook:  !!business.facebook_page_id,
    gmb:       !!business.gmb_account_id,
  }
  const anyConnected = Object.values(connected).some(Boolean)

  const [connectLive, setConnectLive] = useState({ gmb: false, meta: false })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/social/connect/gmb/config').then((r) => r.json()),
      fetch('/api/social/connect/meta/config').then((r) => r.json()),
    ])
      .then(([gmb, meta]) => {
        if (cancelled) return
        setConnectLive({
          gmb:  !!(gmb.gmbConnectEnabled || gmb.canUseGmbConnectDemo),
          meta: !!(meta.metaConnectEnabled || meta.canUseMetaConnectDemo),
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const manualPostGuide = useMemo(() => {
    const platforms: SocialComingSoonPlatform[] = []
    const showApprovalNote: Partial<Record<SocialComingSoonPlatform, boolean>> = {}

    if (!connected.gmb || !connectLive.gmb) {
      platforms.push('google_business')
      showApprovalNote.google_business = !connectLive.gmb
    }
    if (!connected.facebook || !connectLive.meta) {
      platforms.push('facebook')
      showApprovalNote.facebook = !connectLive.meta
    }
    if (!connected.instagram || !connectLive.meta) {
      platforms.push('instagram')
      showApprovalNote.instagram = !connectLive.meta
    }

    return { platforms, showApprovalNote }
  }, [connected.gmb, connected.facebook, connected.instagram, connectLive.gmb, connectLive.meta])

  const defaultPlatform = (): PostPlatform => {
    if (connected.instagram) return 'instagram'
    if (connected.facebook) return 'facebook'
    if (connected.gmb) return 'gmb'
    return 'instagram'
  }

  const [selectedPlatforms, setSelectedPlatforms] = useState<PostPlatform[]>(
    () => defaultSelectedPlatforms(connected),
  )

  /** Stage 2 will loop all platforms; Stage 1 uses first selected only. */
  const captionPlatform = selectedPlatforms[0] ?? defaultPlatform()

  function togglePlatform(p: PostPlatform) {
    if (!connected[p]) return
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) {
        if (prev.length <= 1) {
          toast('Select at least one platform', 'error')
          return prev
        }
        return prev.filter((x) => x !== p)
      }
      return [...prev, p]
    })
  }

  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [renderId, setRenderId] = useState<string | null>(null)
  const postReadyRef = useRef<HTMLDivElement>(null)

  const [captions, setCaptions] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [captionLoading, setCaptionLoading] = useState(false)
  const [selectedCaptionIdx, setSelectedCaptionIdx] = useState<number | null>(null)

  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule' | 'draft'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [submitting, setSubmitting] = useState(false)
  const [postedSuccess, setPostedSuccess] = useState(false)

  /** Kept for legacy fieldValues key on photo upload only. */
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  const tradeCategoryForPhotos =
    inferTradeCategory({
      ai_agent_services: business.ai_agent_services,
      name:              business.name,
    }) ?? 'general'

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null

  const loadJobs = useCallback(async () => {
    setJobsLoading(true)
    try {
      const res = await fetch('/api/social/completed-jobs')
      const json = await res.json()
      if (res.ok) setJobs(json.jobs || [])
    } finally {
      setJobsLoading(false)
    }
  }, [])

  useEffect(() => { loadJobs() }, [loadJobs])

  useEffect(() => {
    if (agentSuggestionId?.trim()) {
      setLinkedAgentSuggestionId(agentSuggestionId.trim())
    }
  }, [agentSuggestionId])

  useEffect(() => {
    if (!linkedAgentSuggestionId || weekAheadPrefillHandled.current) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/agent-suggestions/${linkedAgentSuggestionId}`)
        const json = await res.json()
        if (!res.ok || cancelled) return
        const row = json.suggestion
        if (!row || row.type !== 'social_post' || row.status !== 'pending') return

        const draft = row.draft_content as SocialDraftContent
        const plan = resolveSocialDraftRenderPlan(draft)
        const categoryId =
          draft.category_id && isPostCategoryId(draft.category_id)
            ? draft.category_id
            : 'show_our_work'
        const subtypeId =
          draft.subtype_id && isPostSubtypeId(draft.subtype_id)
            ? draft.subtype_id
            : 'completed_job'

        weekAheadPrefillHandled.current = true
        setPostCategory(categoryId)
        setPostSubtype(subtypeId)
        setContentFormat(plan.format)
        setPhotoSource(plan.photoSource)
        setInfographicPreset(plan.infographicPreset)
        setInfographicContent(null)
        resetPhotoBillingFlags()
        if (plan.photoUrl) {
          setComposePhotoUrl(plan.photoUrl)
          setComposePhotoHttpsUrl(isCanonicalHttpsPhotoUrl(plan.photoUrl) ? plan.photoUrl : '')
          setComposePhotoStoragePath('')
        } else if (plan.photoSource === 'none') {
          setComposePhotoUrl('')
          setComposePhotoHttpsUrl('')
          setComposePhotoStoragePath('')
        }

        if (draft.job_id) {
          setSelectedJobId(draft.job_id)
        }

        if (plan.format === 'scene') {
          setSceneContent(
            sceneContentFromSocialDraft(draft, {
              name: business.name,
              phone: business.phone,
              social_default_cta: business.social_default_cta,
            }),
          )
        }

        if (draft.caption?.trim()) {
          setCaption(draft.caption.trim())
          weekAheadCaptionLocked.current = true
        }

        if (plan.photoSource === 'ai_generate') {
          const purpose = aiPurposeForSubtype(subtypeId)
          const scenesRes = await fetch('/api/social/ai-image/scenes')
          const scenesJson = await scenesRes.json()
          const scenes = (scenesJson.scenes ?? []) as Array<{ id: string; purpose: string }>
          const scene = scenes.find((s) => s.purpose === purpose)
          if (scene) {
            setDefaultAiBackground({
              purpose,
              sceneId: scene.id,
              style: 'photorealistic',
            })
          }
        }
      } catch (err) {
        console.warn('[CreateTab] Week Ahead prefill failed', err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [linkedAgentSuggestionId, business.name, business.phone, business.social_default_cta])

  useEffect(() => {
    if (initialComposeStep !== '2') return
    const t = window.setTimeout(() => {
      composeStep2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 350)
    return () => window.clearTimeout(t)
  }, [initialComposeStep, jobsLoading])

  useEffect(() => {
    if (!selectedJobId) {
      setJobPhotos([])
      return
    }
    setPhotosLoading(true)
    fetch(`/api/social/jobs/${selectedJobId}/photos`)
      .then((r) => r.json())
      .then((json) => {
        setJobPhotos(json.photos || [])
      })
      .finally(() => setPhotosLoading(false))
  }, [selectedJobId])

  useEffect(() => {
    if (initialJobId && jobs.length && !initialJobHandled.current) {
      initialJobHandled.current = true
      selectOccasion('show_our_work', 'completed_job', { keepJob: false })
      setSelectedJobId(initialJobId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJobId, jobs])

  const persistComposeOccasion = useCallback(
    async (categoryId: PostCategoryId, subtypeId: PostSubtypeId) => {
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('businesses')
          .update({
            social_compose_last_category: categoryId,
            social_compose_last_subtype: subtypeId,
          })
          .eq('id', business.id)
        if (error) {
          console.warn('[CreateTab] compose occasion save failed:', error.message)
          return
        }
        onComposePrefsUpdate?.({
          social_compose_last_category: categoryId,
          social_compose_last_subtype: subtypeId,
        })
      } catch (e) {
        console.warn('[CreateTab] compose occasion save error:', e)
      }
    },
    [business.id, onComposePrefsUpdate],
  )

  function composePhotoPayload() {
    if (photoSource === 'none') return { photoUrl: null as string | null, photoStoragePath: null as string | null }
    if (isCanonicalHttpsPhotoUrl(composePhotoHttpsUrl)) {
      return {
        photoUrl: composePhotoHttpsUrl.trim(),
        photoStoragePath: composePhotoStoragePath || null,
      }
    }
    if (composePhotoStoragePath) {
      return { photoUrl: null as string | null, photoStoragePath: composePhotoStoragePath }
    }
    return { photoUrl: null as string | null, photoStoragePath: null as string | null }
  }

  function hasServerComposePhoto() {
    return isCanonicalHttpsPhotoUrl(composePhotoHttpsUrl) || Boolean(composePhotoStoragePath)
  }

  function applyComposePhotoSelection(url: string) {
    setComposePhotoStoragePath('')
    setComposePhotoUrl(url)
    setComposePhotoHttpsUrl(isCanonicalHttpsPhotoUrl(url) ? url : '')
    handleFieldChange('photo', url)
    resetPhotoBillingFlags()
  }

  async function handlePhotoUpload(fieldKey: string, file: File) {
    const localPreview = URL.createObjectURL(file)
    setUploadingPhotoKey(fieldKey)
    setFieldValues((prev) => ({ ...prev, [fieldKey]: localPreview }))
    if (fieldKey === 'compose') {
      setComposePhotoUrl(localPreview)
      setComposePhotoHttpsUrl('')
      setComposePhotoStoragePath('')
      setPhotoSource('upload')
    }
    try {
      const uploaded = await uploadInspirationTempFile(file)
      setFieldValues((prev) => ({ ...prev, [fieldKey]: localPreview }))
      if (fieldKey === 'compose') {
        setComposePhotoStoragePath(uploaded.path)
        setComposePhotoHttpsUrl(uploaded.httpsUrl)
        setPhotoSource('upload')
      }
    } catch (err) {
      toast(mapComposeUploadFailure(err), 'error')
      if (fieldKey === 'compose') {
        setComposePhotoHttpsUrl('')
        setComposePhotoStoragePath('')
      }
    } finally {
      setUploadingPhotoKey(null)
    }
  }

  function handleFieldChange(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  function resetPhotoBillingFlags() {
    setAiPhotoCreditSpent(false)
    setPhotoCleanupApplied(false)
  }

  function resetAiDesignedBackground() {
    setAiDesignedBackground(false)
  }

  /** Soft defaults only - applied on subtype change; every combo remains selectable. */
  function applyComposeDefaultsForSubtype(subtypeId: PostSubtypeId) {
    const defaults = composeDefaultsForSubtype(subtypeId)
    setContentFormat(defaults.format)
    setPhotoSource(defaults.photoSource)
    setInfographicPreset(defaults.infographicPreset)
    setInfographicContent(null)
    resetAiDesignedBackground()
    if (defaults.photoSource === 'none') {
      setComposePhotoUrl('')
      setComposePhotoHttpsUrl('')
    }
    setComposePhotoStoragePath('')
  }

  function selectOccasion(
    categoryId: PostCategoryId,
    subtypeId: PostSubtypeId,
    opts?: { keepJob?: boolean },
  ) {
    setAiPhotoSessionKey((k) => k + 1)
    resetPhotoBillingFlags()
    setPostCategory(categoryId)
    setPostSubtype(subtypeId)
    if (opts?.keepJob !== true) setSelectedJobId('')
    applyComposeDefaultsForSubtype(subtypeId)
    refreshSceneContentDefaults()
    void persistComposeOccasion(categoryId, subtypeId)
  }

  function handleCategoryChange(categoryId: PostCategoryId) {
    const subtypeId = defaultSubtypeForCategory(categoryId)
    selectOccasion(categoryId, subtypeId)
  }

  function handleSubtypeChange(subtypeId: PostSubtypeId) {
    const def = getPostSubtypeDefinition(subtypeId)
    selectOccasion(def.categoryId, subtypeId)
  }

  function handleFormatChange(format: ContentFormat) {
    setContentFormat(format)
    setInfographicContent(null)
    setImageUrl(null)
    setRenderId(null)
    if (format !== 'infographic') resetAiDesignedBackground()
  }

  function handlePhotoSourceChange(source: PhotoSource) {
    setPhotoSource(source)
    setAiPhotoSessionKey((k) => k + 1)
    resetPhotoBillingFlags()
    resetAiDesignedBackground()
    setComposePhotoUrl('')
    setComposePhotoHttpsUrl('')
    setComposePhotoStoragePath('')
  }

  function handlePresetChange(preset: InfographicPreset) {
    setInfographicPreset(preset)
    setInfographicContent(null)
  }

  function composePlatformForGenerate(): 'instagram' | 'facebook' | 'gmb' {
    const first = selectedPlatforms[0]
    if (first === 'facebook' || first === 'gmb' || first === 'instagram') return first
    return 'instagram'
  }

  function refreshSceneContentDefaults() {
    setSceneContent(
      buildDefaultSceneContent({
        name: business.name,
        phone: business.phone,
        ai_agent_services: business.ai_agent_services,
        social_default_cta: business.social_default_cta,
      }),
    )
  }

  async function generateQuoteCardImage() {
    if (photoSource !== 'none' && !hasServerComposePhoto()) {
      toast('Select a photo, or switch photo source to No photo', 'error')
      return
    }
    if (!quoteCardContent.quoteText.trim()) {
      toast('Quote text is required', 'error')
      return
    }
    if (!quoteCardContent.customerName.trim()) {
      toast('Customer name is required', 'error')
      return
    }

    setGenerating(true)
    setImageUrl(null)
    setRenderId(null)
    setCaptions([])
    setCaption('')
    setSelectedCaptionIdx(null)

    try {
      const platform = composePlatformForGenerate()
      const payload = {
        quoteText: quoteCardContent.quoteText.trim(),
        customerName: quoteCardContent.customerName.trim(),
        ...(quoteCardContent.starRating != null
          ? { starRating: quoteCardContent.starRating }
          : {}),
        ...(quoteCardContent.introLine.trim()
          ? { introLine: quoteCardContent.introLine.trim() }
          : {}),
        ...(quoteCardContent.ctaLine.trim()
          ? { ctaLine: quoteCardContent.ctaLine.trim() }
          : {}),
      }

      const res = await fetch('/api/social/hybrid-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'quote_card',
          platform,
          photoSource,
          ...composePhotoPayload(),
          content: payload,
          logoCorner,
          jobId: selectedJobId || undefined,
          postSubtype,
          ...(linkedAgentSuggestionId
            ? { agentSuggestionId: linkedAgentSuggestionId }
            : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.code === 'no_render_credits' || json.code === 'insufficient_usage_balance') {
          if (maybeOfferTradiesPostRenderPurchase(json.code, json.error || 'No renders remaining')) {
            return
          }
          throw new Error(json.error || 'No render credits remaining')
        }
        throw new Error(json.error || json.detail || 'Generate failed')
      }
      setImageUrl(json.imageUrl || json.resultUrl)
      setRenderId(json.id ?? null)
      const completingWeekAhead = Boolean(linkedAgentSuggestionId)
      if (completingWeekAhead) {
        setLinkedAgentSuggestionId('')
        weekAheadCaptionLocked.current = false
        toast('Week Ahead suggestion completed - image in Library', 'success')
      }
      await loadCaptions(json.id ?? null)
      await refreshCreditsWithPulse()
      scrollToPostReady()
      if (!completingWeekAhead) {
        toast(
          json.usedFreeTrial
            ? 'Quote card ready - free trial credit used'
            : 'Quote card ready - 1 render credit used',
          'success',
        )
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Generate failed', 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function generateSceneImage() {
    const hasInlineAiBackground =
      photoSource === 'ai_generate' && !composePhotoUrl.trim() && defaultAiBackground
    if (photoSource !== 'none' && !hasServerComposePhoto() && !hasInlineAiBackground) {
      toast('Select a photo, or switch photo source to No photo', 'error')
      return
    }
    if (!sceneContent.headline.trim()) {
      toast('Headline is required', 'error')
      return
    }

    setGenerating(true)
    setImageUrl(null)
    setRenderId(null)
    if (!weekAheadCaptionLocked.current) {
      setCaptions([])
      setCaption('')
      setSelectedCaptionIdx(null)
    }

    try {
      const platform = composePlatformForGenerate()
      const res = await fetch('/api/social/hybrid-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'scene',
          platform,
          photoSource,
          ...composePhotoPayload(),
          content: sceneContent,
          ...(Object.keys(textStyleOverrides).length > 0
            ? { textStyles: textStyleOverrides }
            : {}),
          logoCorner,
          jobId: selectedJobId || undefined,
          postSubtype,
          ...(hasInlineAiBackground
            ? {
                aiBackground: {
                  ...defaultAiBackground,
                  jobDescription:
                    fieldValues.description?.trim() ||
                    resolveJobDescription(
                      selectedJob,
                      descriptionFallback(postSubtype, business.ai_agent_services),
                    ) ||
                    undefined,
                },
              }
            : {}),
          ...(linkedAgentSuggestionId
            ? { agentSuggestionId: linkedAgentSuggestionId }
            : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.code === 'no_render_credits' || json.code === 'insufficient_usage_balance') {
          if (maybeOfferTradiesPostRenderPurchase(json.code, json.error || 'No renders remaining')) {
            return
          }
          throw new Error(json.error || 'No render credits remaining')
        }
        throw new Error(json.error || json.detail || 'Generate failed')
      }
      setImageUrl(json.imageUrl || json.resultUrl)
      setRenderId(json.id ?? null)
      const completingWeekAhead = Boolean(linkedAgentSuggestionId)
      if (completingWeekAhead) {
        setLinkedAgentSuggestionId('')
        weekAheadCaptionLocked.current = false
        toast('Week Ahead suggestion completed - image in Library', 'success')
      }
      await loadCaptions(json.id ?? null)
      await refreshCreditsWithPulse()
      scrollToPostReady()
      if (!completingWeekAhead) {
        toast(
          json.usedFreeTrial
            ? 'Image ready - free trial credit used'
            : 'Image ready - 1 render credit used',
          'success',
        )
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Generate failed', 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function generateInfographicImage() {
    if (photoSource !== 'none' && !hasServerComposePhoto()) {
      toast('Select a photo, or switch photo source to No photo', 'error')
      return
    }

    setGenerating(true)
    setImageUrl(null)
    setRenderId(null)
    if (!weekAheadCaptionLocked.current) {
      setCaptions([])
      setCaption('')
      setSelectedCaptionIdx(null)
    }
    setInfographicContentLoading(true)

    try {
      const platform = composePlatformForGenerate()
      const contentResult = await fetchInfographicContent({
        preset: infographicPreset,
        platform,
        postSubtype:  postSubtype,
        jobId: selectedJobId || undefined,
        generationHints: null,
      })
      setInfographicContent(contentResult.content)
      setInfographicContentLoading(false)

      const res = await fetch('/api/social/hybrid-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'infographic',
          preset: infographicPreset,
          platform,
          photoSource,
          ...composePhotoPayload(),
          content: contentResult.content,
          logoCorner,
          jobId: selectedJobId || undefined,
          postSubtype,
          ...(aiDesignedBackground && photoSource === 'none'
            ? { aiDesignedBackground: true }
            : {}),
          ...(linkedAgentSuggestionId
            ? { agentSuggestionId: linkedAgentSuggestionId }
            : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.code === 'no_render_credits' || json.code === 'insufficient_usage_balance') {
          if (maybeOfferTradiesPostRenderPurchase(json.code, json.error || 'No renders remaining')) {
            return
          }
          throw new Error(json.error || 'No render credits remaining')
        }
        throw new Error(json.error || json.detail || 'Generate failed')
      }
      setImageUrl(json.imageUrl || json.resultUrl)
      setRenderId(json.id ?? null)
      const completingWeekAhead = Boolean(linkedAgentSuggestionId)
      if (completingWeekAhead) {
        setLinkedAgentSuggestionId('')
        weekAheadCaptionLocked.current = false
        toast('Week Ahead suggestion completed - image in Library', 'success')
      }
      await loadCaptions(json.id ?? null)
      await refreshCreditsWithPulse()
      scrollToPostReady()
      if (!completingWeekAhead) {
        const creditsUsed =
          typeof json.creditsCharged === 'number' ? json.creditsCharged : 1
        toast(
          json.usedFreeTrial
            ? 'Infographic ready - free trial credit used'
            : creditsUsed === 2
              ? 'Infographic ready - 2 render credits used'
              : 'Infographic ready - 1 render credit used',
          'success',
        )
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Generate failed', 'error')
    } finally {
      setInfographicContentLoading(false)
      setGenerating(false)
    }
  }

  function generateImage() {
    if (contentFormat === 'infographic') {
      void generateInfographicImage()
      return
    }
    if (contentFormat === 'quote_card') {
      void generateQuoteCardImage()
      return
    }
    void generateSceneImage()
  }

  async function persistRenderCaption(id: string | null | undefined, text: string) {
    if (!id || !text.trim()) return
    try {
      await fetch(`/api/social/hybrid-renders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: text.trim() }),
      })
    } catch {
      // Library can still generate later
    }
  }

  async function loadCaptions(afterRenderId?: string | null) {
    const id = afterRenderId ?? renderId
    if (weekAheadCaptionLocked.current) {
      await persistRenderCaption(id, caption)
      return
    }
    setCaptionLoading(true)
    try {
      const res = await fetch('/api/social/generate-caption', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          jobId:        selectedJobId || undefined,
          platform:     captionPlatform,
          brandVoice:   business.social_brand_voice || 'professional',
          postSubtype,
          ...(contentFormat === 'quote_card' && quoteCardContent.quoteText.trim()
            ? {
                quoteText:    quoteCardContent.quoteText.trim(),
                customerName: quoteCardContent.customerName.trim(),
              }
            : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Caption failed')
      if (json.captions?.length) {
        setCaptions(json.captions)
        setCaption(json.captions[0])
        setSelectedCaptionIdx(0)
        await persistRenderCaption(id, json.captions[0])
      }
    } catch {
      toast('Could not generate captions - write your own', 'error')
    } finally {
      setCaptionLoading(false)
    }
  }

  function resetFlow() {
    setPostedSuccess(false)
    setImageUrl(null)
    setRenderId(null)
    setCaptions([])
    setCaption('')
    setSelectedCaptionIdx(null)
    setSelectedJobId('')
    const resetOccasion = composeOccasionFromBusinessPrefs(
      business.social_compose_last_category,
      business.social_compose_last_subtype,
    )
    setPostCategory(resetOccasion.categoryId)
    setPostSubtype(resetOccasion.subtypeId)
    applyComposeDefaultsForSubtype(resetOccasion.subtypeId)
    setComposePhotoUrl('')
    setComposePhotoHttpsUrl('')
    resetPhotoBillingFlags()
    setLogoCorner(parseSocialLogoCorner(business.social_logo_corner))
    refreshSceneContentDefaults()
    if (isTradiesPost) {
      setTpCreateAtSelector(true)
      setCreationMode(DEFAULT_SOCIAL_CREATION_MODE)
    }
  }

  function scrollToPostReady() {
    requestAnimationFrame(() => {
      postReadyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function downloadImage() {
    if (!imageUrl) return
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png'
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `stitchedup-post-${Date.now()}.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
      toast('Image downloaded', 'success')
    } catch {
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = `stitchedup-post-${Date.now()}.png`
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.click()
      toast('Opening image - save from your browser if download did not start', 'success')
    }
  }

  async function copyCaption() {
    if (!caption.trim()) {
      toast('Nothing to copy', 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(caption)
      toast('Caption copied', 'success')
    } catch {
      toast('Could not copy - select and copy manually', 'error')
    }
  }

  async function submitManualPost() {
    if (!caption.trim()) { toast('Add a caption', 'error'); return }
    if (!imageUrl) { toast('Generate an image first', 'error'); return }

    setSubmitting(true)
    try {
      const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : []
      const processed = {
        instagram_square: [imageUrl],
        facebook:         [imageUrl],
        gmb:              [imageUrl],
      }

      const createRes = await fetch('/api/social/posts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          jobId:              selectedJobId || undefined,
          caption,
          platforms,
          photoUrls:          [imageUrl],
          processedPhotoUrls: processed,
          status:             'posted',
          postedAt:           new Date().toISOString(),
          postedManually:     true,
          jobSuburb:          selectedJob?.site_suburb,
          jobState:           selectedJob?.site_state,
          composeCategory:    postCategory,
          composeSubtype:     postSubtype,
        }),
      })
      const { error } = await createRes.json()
      if (!createRes.ok) throw new Error(error || 'Failed to save post')

      toast('Marked as posted manually', 'success')
      setPostedSuccess(true)
      setAiPhotoSessionKey((k) => k + 1)
      onPostCreated()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save post', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitPost() {
    if (!caption.trim()) { toast('Add a caption', 'error'); return }
    if (!imageUrl) { toast('Generate an image first', 'error'); return }
    if (scheduleMode !== 'draft' && !selectedPlatforms.some((p) => connected[p])) {
      toast('Connect a selected platform in Settings before posting', 'error')
      return
    }

    setSubmitting(true)
    try {
      const platforms = selectedPlatforms
      const processed = {
        instagram_square: [imageUrl],
        facebook:         [imageUrl],
        gmb:              [imageUrl],
      }

      let scheduledFor: string | null = null
      if (scheduleMode === 'schedule') {
        if (!scheduledDate) { toast('Pick a date', 'error'); setSubmitting(false); return }
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
      }

      const status = scheduleMode === 'draft' ? 'draft' : scheduleMode === 'schedule' ? 'scheduled' : 'draft'

      const createRes = await fetch('/api/social/posts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          jobId:              selectedJobId || undefined,
          caption,
          platforms,
          photoUrls:          [imageUrl],
          processedPhotoUrls: processed,
          scheduledFor:       scheduleMode === 'schedule' ? scheduledFor : null,
          status,
          jobSuburb:          selectedJob?.site_suburb,
          jobState:           selectedJob?.site_state,
          composeCategory:    postCategory,
          composeSubtype:     postSubtype,
        }),
      })
      const { post, error } = await createRes.json()
      if (!createRes.ok) throw new Error(error || 'Failed to save post')

      if (scheduleMode === 'now') {
        const pubRes = await fetch(`/api/social/posts/${post.id}/publish`, { method: 'POST' })
        if (!pubRes.ok) {
          const pubJson = await pubRes.json()
          throw new Error(pubJson.error || 'Publish failed')
        }
        toast('Post published! 🎉', 'success')
      } else if (scheduleMode === 'schedule') {
        toast('Post scheduled ✅', 'success')
      } else {
        toast('Draft saved', 'success')
      }

      setPostedSuccess(true)
      setAiPhotoSessionKey((k) => k + 1)
      onPostCreated()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to post', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const charLimit = CHAR_LIMITS[captionPlatform]
  const charCount = caption.length
  const derivedAiPurpose = aiPurposeForSubtype(postSubtype)
  const creditEstimateInput = {
    photoSource,
    aiPhotoCreditSpent,
    photoCleanupApplied,
    aiDesignedBackground:
      contentFormat === 'infographic' &&
      photoSource === 'none' &&
      aiDesignedBackground,
    accounting: renderCredits?.accounting === 'wallet' ? 'wallet' as const : 'legacy' as const,
  }
  const totalCredits = estimateComposeCreditsTotal(creditEstimateInput).credits
  const generateStepLabel =
    contentFormat === 'infographic'
      ? 'Generate infographic'
      : contentFormat === 'quote_card'
        ? 'Generate quote card'
        : 'Generate image'
  const hasLogo = !!business.logo_url?.trim()
  const formatAccent = FORMAT_ACCENTS[contentFormat]
  const previewPlatform = composePlatformForGenerate()
  const showComposeJobStep =
    getPostSubtypeDefinition(postSubtype).suggestJobPicker || photoSource === 'job'
  const tpStepJob = 2
  const tpStepOccasion = showComposeJobStep ? 3 : 2
  const tpStepCustomise = showComposeJobStep ? 4 : 3
  const tpStepGenerate = showComposeJobStep ? 5 : 4
  const tpStepReady = showComposeJobStep ? 6 : 5
  const scratchStepCustomise = showComposeJobStep ? 4 : 3
  const scratchStepGenerate = showComposeJobStep ? 5 : 4
  const scratchStepReady = showComposeJobStep ? 6 : 5

  if (postedSuccess) {
    return (
      <div className="rounded-xl border border-[#EDEAE2] bg-white p-12 text-center">
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-500" />
        <h2 className="text-xl font-black text-black mb-2">Post saved!</h2>
        <p className="text-sm text-[#888] mb-6">Your branded post is ready. Check Scheduled or Published tabs.</p>
        <button
          type="button"
          onClick={resetFlow}
          className="rounded-xl bg-[#FFD700] px-6 py-3 text-sm font-black text-black hover:bg-yellow-400"
        >
          Create another
        </button>
      </div>
    )
  }

  return (
    <div
      className={
        isTradiesPost
          ? 'space-y-5'
          : 'rounded-2xl bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F3ED]/60 p-1 sm:p-2'
      }
      data-post-category={postCategory}
      data-post-subtype={postSubtype}
      data-photo-source={photoSource}
      data-infographic-preset={infographicPreset}
      data-infographic-content-ready={infographicContent ? '1' : '0'}
      data-compose-tab={composeTab}
      data-creation-mode={creationMode}
      data-tp-create={isTradiesPost ? '1' : undefined}
      data-tp-route={isTradiesPost ? tpCreateRoute : undefined}
      data-tp-at-selector={isTradiesPost ? (tpCreateAtSelector ? '1' : '0') : undefined}
    >
      {isTradiesPost ? (
        creationMode === 'images' ? <TradiesPostBuildMyWeekLink /> : null
      ) : (
        <BuildMyWeekPlannerBanner />
      )}

      {!isTradiesPost ? <SocialCreationModeSelector value={creationMode} onChange={setCreationMode} /> : null}

      {isTradiesPost ? (
        tpCreateAtSelector ? (
          <TradiesPostCreateRouteSelector
            value={tpCreateRoute}
            onChange={enterTpCreateFlow}
            showIdeaRoute={aiDesignedEnabled}
            picking
          />
        ) : (
          <>
            <TradiesPostBackToCreateOptions onClick={backToCreateOptions} />

            {creationMode === 'video' && tpCreateRoute === 'photos' ? (
              <CreateVideoWorkspace
                onViewLibrary={onViewLibrary}
                onUploadComplete={onPostCreated}
              />
            ) : (
              <>
                {tpCreateRoute === 'photos' ? (
                  <SocialCreationModeSelector
                    value={creationMode}
                    onChange={handleTpCreationModeChange}
                    variant="tradiespost"
                  />
                ) : null}

                {tpCreateRoute === 'inspiration' ? (
                  <>
                    <TradiesPostRecreateIntro />
                    <RecreateTab
                      business={business}
                      onSwitchToScratch={(carry) => void carryPhotoToScratch(carry)}
                      onPostCreated={onPostCreated}
                    />
                  </>
                ) : null}

                {tpCreateRoute === 'idea' && scratchSurface.showAiDesigned ? (
                  <>
                    <AiDesignedPanel
                      business={business}
                      onPostCreated={onPostCreated}
                      presentation="tradiespost"
                    />
                    {aiDesignedEnabled ? (
                      <p className="text-center text-sm text-zinc-600">
                        Want full control?{' '}
                        <button
                          type="button"
                          onClick={() => enterTpCreateFlow('photos')}
                          className="font-semibold text-[#18181B] underline decoration-[#F5C518]/60 underline-offset-2 hover:decoration-[#F5C518]"
                          data-testid="tp-switch-to-build-layout"
                        >
                          Build a Layout
                        </button>
                      </p>
                    ) : null}
                  </>
                ) : null}

                {tpCreateRoute === 'photos' && creationMode === 'images' ? (
            <>
    {scratchSurface.showBuilder && (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {/* Step 2 - Format & photo (media-first for TradiesPost) */}
        <div className={COMPOSE_STEP_CARD} ref={composeStep2Ref} id="compose-step-2">
          <StepHeader n={1} title="Your photos & videos" accentDot={formatAccent.dot} />
          <div className="p-4 space-y-4">
            <ComposeAxesPanel
              contentFormat={contentFormat}
              photoSource={photoSource}
              infographicPreset={infographicPreset}
              onFormatChange={handleFormatChange}
              onPhotoSourceChange={handlePhotoSourceChange}
              onPresetChange={handlePresetChange}
            />

            <p
              className="text-[11px] text-[#888]"
              data-testid="compose-credit-hint-step2"
              data-credit-total={totalCredits}
              data-photo-source={photoSource}
              data-ai-designed-background={aiDesignedBackground ? '1' : '0'}
            >
              {formatPhotoSourceCreditHint(creditEstimateInput)}
            </p>

            {contentFormat === 'infographic' &&
              photoSource === 'none' &&
              infographicAiBackgroundEnabled && (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#EDEAE2] bg-[#FAFAF8] px-3.5 py-3 transition-colors hover:border-indigo-200"
                data-testid="compose-ai-designed-background-toggle"
              >
                <input
                  type="checkbox"
                  checked={aiDesignedBackground}
                  onChange={(e) => setAiDesignedBackground(e.target.checked)}
                  className="mt-0.5 accent-[#FFD700]"
                />
                <span className="text-xs text-[#444]">
                  <span className="font-semibold text-[#222]">Designed background (AI)</span>
                  {' - '}
                  Generate a custom frame behind your infographic text. All copy stays in the
                  template overlay - not baked into the image.
                </span>
              </label>
            )}

            {photoSource !== 'none' && (
              <PhotoFieldPicker
                label="Photo"
                selectedUrl={composePhotoUrl}
                canonicalUrl={composePhotoHttpsUrl}
                onSelect={applyComposePhotoSelection}
                jobPhotos={jobPhotos}
                photosLoading={photosLoading}
                selectedJobId={selectedJobId}
                uploading={uploadingPhotoKey === 'compose'}
                onUpload={(file) => handlePhotoUpload('compose', file)}
                tradeCategory={tradeCategoryForPhotos}
                photoSource={photoSource}
                derivedPurpose={derivedAiPurpose}
                onAiPhotoGenerated={() => {
                  setAiPhotoCreditSpent(true)
                  void refreshCreditsWithPulse()
                }}
                onCleanupApplied={() => {
                  setPhotoCleanupApplied(true)
                  void refreshCreditsWithPulse()
                }}
                jobDescription={
                  fieldValues.description?.trim() ||
                  resolveJobDescription(
                    selectedJob,
                    descriptionFallback(postSubtype, business.ai_agent_services),
                  )
                }
                brandColor={business.brand_color}
                businessName={business.name?.trim() || 'Your Business'}
                aiSessionKey={aiPhotoSessionKey}
              />
            )}

            {contentFormat === 'infographic' && infographicContent && (
              <div className="rounded-lg border border-[#EDEAE2] bg-[#FAFAF8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#999] mb-1">
                  AI copy ready
                </p>
                <pre className="text-[11px] text-[#444] whitespace-pre-wrap max-h-40 overflow-auto">
                  {JSON.stringify(infographicContent, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 - Job picker when subtype suggests it, or when photo source needs a job */}
        {showComposeJobStep && (
          <div
            className={`${COMPOSE_STEP_CARD}`}
            data-testid="compose-step-3"
          >
            <StepHeader n={tpStepJob} title="Pick a product or offer" />
            <div className="p-4 space-y-3">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                disabled={jobsLoading}
                className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2.5 text-sm disabled:opacity-60"
              >
                <option value="">None - write my own</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{formatJobLabel(j)}</option>
                ))}
              </select>
              {jobsLoading && (
                <p className="text-xs text-[#888] flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading jobs…
                </p>
              )}
            </div>
          </div>
        )}

        <div className={COMPOSE_STEP_CARD}>
          <StepHeader n={tpStepOccasion} title="What are we posting?" />
          <div className="p-4">
            <ComposeOccasionPicker
              categoryId={postCategory}
              subtypeId={postSubtype}
              onCategoryChange={handleCategoryChange}
              onSubtypeChange={handleSubtypeChange}
            />
          </div>
        </div>

        {/* Step 4 - Content fields & platforms */}
        <div
          className={COMPOSE_STEP_CARD}
          data-testid="compose-step-4"
        >
          <StepHeader
            n={tpStepCustomise}
            title={
              contentFormat === 'scene' || contentFormat === 'quote_card'
                ? 'Customise content'
                : 'Platforms & copy'
            }
          />
          <div className="p-4 space-y-3">
            {contentFormat === 'scene' && (
              <SceneContentFields
                content={sceneContent}
                onChange={setSceneContent}
              />
            )}

            {contentFormat === 'quote_card' && (
              <QuoteCardContentFields
                content={quoteCardContent}
                onChange={setQuoteCardContent}
              />
            )}

            {contentFormat === 'infographic' && (
              <p className="text-xs text-[#666]">
                Copy is generated with AI from your trade and services when you hit Generate.
                {infographicContentLoading ? ' Generating copy…' : ''}
              </p>
            )}

            {hasLogo && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#666]">
                  Logo position (this post)
                </label>
                <LogoCornerPicker value={logoCorner} onChange={setLogoCorner} />
                <p className="mt-1.5 text-[10px] text-[#AAA]">
                  Override for this post - default is in Post defaults above.
                </p>
              </div>
            )}

            {/* Platform */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#666]">Platforms</label>
              <div className="space-y-2">
                <PlatformToggle
                  label="Instagram (1080×1080)"
                  platform="instagram"
                  connected={connected.instagram}
                  selected={selectedPlatforms.includes('instagram')}
                  onToggle={() => togglePlatform('instagram')}
                />
                <PlatformToggle
                  label="Facebook (1200×630)"
                  platform="facebook"
                  connected={connected.facebook}
                  selected={selectedPlatforms.includes('facebook')}
                  onToggle={() => togglePlatform('facebook')}
                />
                <PlatformToggle
                  label="Google Business (1080×1350)"
                  platform="gmb"
                  connected={connected.gmb}
                  selected={selectedPlatforms.includes('gmb')}
                  onToggle={() => togglePlatform('gmb')}
                />
              </div>
              {selectedPlatforms.length === 0 && anyConnected && (
                <p className="mt-2 text-xs text-amber-700">Select connected platforms for auto-posting, or generate and post manually below.</p>
              )}
              {!anyConnected && (
                <>
                  <p className="mt-2 text-xs text-[#666]">
                    No platforms connected - generate your image, download it, copy the caption, and post in Instagram or Facebook yourself.
                  </p>
                  <Link
                    href="/dashboard/social/connections"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#FFD700] hover:underline"
                  >
                    <Zap className="h-3 w-3" /> Connect platforms for auto-posting →
                  </Link>
                </>
              )}
              {anyConnected && selectedPlatforms.length === 0 && (
                <Link
                  href="/dashboard/social/connections"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#888] hover:underline"
                >
                  Manage connections →
                </Link>
              )}
            </div>

            {contentFormat === 'scene' && (
            <div className="border-t border-[#F0EDE5] pt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-[#666]">Text position</p>
                <SceneStackLayoutPicker
                  value={stackLayoutFromStyles(textStyles)}
                  onChange={handleStackLayoutChange}
                />
                <p className="mt-1.5 text-[10px] text-[#AAA]">
                  Applies to this post only. Change defaults in Post defaults above.
                </p>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold text-[#666]">Text style</p>
                <SocialTextStyleEditor
                  inline
                  styles={textStyles}
                  onChange={handleTextStyleChange}
                  elements={['headline', 'tagline']}
                  fontPreviewPhrase={business.name}
                  hint="Applies to this post only. Change defaults in Post defaults above."
                />
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Step 5 - Generate */}
        <div className={COMPOSE_STEP_CARD}>
          <StepHeader
            n={tpStepGenerate}
            title={generateStepLabel}
            accentDot={formatAccent.dot}
          />
          <div className="p-4 space-y-3">
            <button
              type="button"
              disabled={
                generating ||
                uploadingPhotoKey === 'compose' ||
                (contentFormat === 'scene' &&
                  (!sceneContent.headline.trim() ||
                    (photoSource !== 'none' && !hasServerComposePhoto()))) ||
                (contentFormat === 'quote_card' &&
                  (!quoteCardContent.quoteText.trim() ||
                    !quoteCardContent.customerName.trim() ||
                    (photoSource !== 'none' && !hasServerComposePhoto()))) ||
                (contentFormat === 'infographic' &&
                  photoSource !== 'none' &&
                  !hasServerComposePhoto())
              }
              onClick={generateImage}
              className="w-full rounded-2xl bg-[#FFD700] py-3.5 text-sm font-black text-black shadow-md transition-all duration-200 hover:bg-yellow-400 hover:shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating your post…</>
              ) : contentFormat === 'infographic' ? (
                <><Sparkles className="h-4 w-4" /> Generate infographic</>
              ) : contentFormat === 'quote_card' ? (
                <><Sparkles className="h-4 w-4" /> Generate quote card</>
              ) : (
                <><Camera className="h-4 w-4" /> Generate image</>
              )}
            </button>
            {(contentFormat === 'infographic' ||
              contentFormat === 'scene' ||
              contentFormat === 'quote_card') && (
              <p
                className="text-[11px] text-[#888]"
                data-testid="compose-credit-hint-step5"
                data-credit-total={totalCredits}
                data-photo-source={photoSource}
              >
                {formatComposeGenerateStepCreditLine(creditEstimateInput)}
                {' '}
                {totalCredits > 1 && (
                  <span className="text-[#AAA]">
                    ({formatComposeTotalCreditLine(creditEstimateInput)})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Post-generation - unified for all formats */}
        {imageUrl && (
          <div
            ref={postReadyRef}
            className={`${COMPOSE_STEP_CARD} ring-2 ring-[#FFD700]/35 border-[#FFD700]/60 scroll-mt-4`}
            data-testid="compose-post-ready"
          >
            <StepHeader n={tpStepReady} title="Your post is ready" accentDot={formatAccent.dot} />
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadImage}
                  className="flex items-center gap-1.5 rounded-xl bg-[#111] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#222] hover:shadow-md"
                >
                  <Download className="h-3.5 w-3.5" /> Download image
                </button>
                <InfoGuide topic="download" />
                <button
                  type="button"
                  onClick={copyCaption}
                  disabled={!caption.trim()}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-[#111] bg-white px-3.5 py-2.5 text-xs font-bold text-[#111] transition-all duration-200 hover:bg-[#FAFAF7] disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy caption
                </button>
                <button
                  type="button"
                  onClick={generateImage}
                  disabled={generating}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 transition-all duration-200 hover:bg-indigo-100 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => { setImageUrl(null); setCaptions([]); setCaption(''); setRenderId(null) }}
                  className="rounded-xl border border-dashed border-[#CCC] bg-[#FAFAF7] px-3.5 py-2.5 text-xs font-semibold text-[#666] transition-all duration-200 hover:border-[#999] hover:text-[#333]"
                >
                  Try a different style
                </button>
              </div>

              {manualPostGuide.platforms.length > 0 && (
                <SocialManualPostGuide
                  platforms={manualPostGuide.platforms}
                  showApprovalNote={manualPostGuide.showApprovalNote}
                />
              )}

              {captionLoading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-[#888]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#FFD700]" />
                  Writing captions…
                </div>
              ) : (
                captions.length > 0 && (
                  <div className="space-y-2">
                    {captions.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCaption(c)
                          setSelectedCaptionIdx(i)
                          void persistRenderCaption(renderId, c)
                        }}
                        className={`w-full rounded-xl border p-3 text-left text-sm transition-all ${
                          selectedCaptionIdx === i
                            ? 'border-[#FFD700] bg-[#FFFBEA]'
                            : 'border-[#EDEAE2] bg-[#FAFAF7] hover:border-[#CCC]'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-[#AAA]">Option {i + 1}</span>
                        <p className="mt-1 text-[#555] line-clamp-3 whitespace-pre-wrap">{c}</p>
                      </button>
                    ))}
                  </div>
                )
              )}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => loadCaptions()}
                  disabled={captionLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#888] hover:text-black"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Regenerate captions
                </button>
                <InfoGuide topic="regenerateCaption" />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-0.5 text-xs font-semibold text-[#666]">
                  Your caption
                  <InfoGuide topic="caption" />
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => {
                    weekAheadCaptionLocked.current = false
                    setCaption(e.target.value)
                  }}
                  onBlur={() => {
                    void persistRenderCaption(renderId, caption)
                  }}
                  rows={5}
                  placeholder="Edit your caption…"
                  className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                />
                <p className={`mt-1 text-xs ${charCount > charLimit ? 'text-red-600 font-semibold' : 'text-[#AAA]'}`}>
                  {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters ({captionPlatform.toUpperCase()})
                </p>
              </div>

              {anyConnected && selectedPlatforms.some((p) => connected[p]) && (
                <>
                  <div className="border-t border-[#F0EDE5] pt-3 space-y-3">
                    <p className="flex items-center gap-0.5 text-xs font-semibold text-[#666]">
                      Post via connected platforms
                      <InfoGuide topic="publishTo" />
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      {(['now', 'schedule', 'draft'] as const).map((m) => (
                        <span key={m} className="inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => setScheduleMode(m)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                              scheduleMode === m ? 'bg-[#FFD700] text-black' : 'bg-[#F0EDE5] text-[#666]'
                            }`}
                          >
                            {m === 'now' ? 'Post now' : m === 'schedule' ? 'Schedule' : 'Save draft'}
                          </button>
                          {m === 'now' ? <InfoGuide topic="postNow" /> : null}
                          {m === 'schedule' ? <InfoGuide topic="schedule" /> : null}
                        </span>
                      ))}
                    </div>
                    {scheduleMode === 'schedule' && (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                        />
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={submitting || !caption.trim()}
                      onClick={submitPost}
                      className="w-full rounded-xl bg-black py-3.5 text-sm font-black text-white hover:bg-[#222] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {scheduleMode === 'now' ? 'Post now' : scheduleMode === 'schedule' ? 'Schedule post' : 'Save draft'}
                    </button>
                  </div>
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-[#EDEAE2]" />
                    <span className="mx-3 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#AAA]">or</span>
                    <div className="flex-grow border-t border-[#EDEAE2]" />
                  </div>
                </>
              )}

              <p className="text-xs text-[#888]">
                Posted outside Vendl? Save it to your history without connecting a platform.
              </p>
              <button
                type="button"
                disabled={submitting || !caption.trim()}
                onClick={submitManualPost}
                className="w-full rounded-xl border border-[#EDEAE2] bg-[#FAFAF7] py-3.5 text-sm font-black text-[#444] hover:border-[#FFD700] hover:bg-[#FFFBEA] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Mark as posted manually
              </button>
            </div>
          </div>
        )}
      </div>

      <ComposePreviewPanel
        platform={previewPlatform}
        contentFormat={contentFormat}
        imageUrl={imageUrl}
        renderId={renderId}
        credits={renderCredits}
        creditsLoading={renderCreditsLoading}
        creditsPulseKey={creditsPulseKey}
      />
    </div>
    )}
            </>
          ) : null}
              </>
            )}
          </>
        )
      ) : creationMode === 'video' ? (
        <CreateVideoWorkspace
          onViewLibrary={onViewLibrary}
          onUploadComplete={onPostCreated}
        />
      ) : (
    <Tabs value={composeTab} onValueChange={(v) => handleComposeTabChange(v as ComposeTabId)}>
      <TabsList className="mb-2 px-1">
        {COMPOSE_TABS.map((tab) =>
          tab.id === 'recreate' ? (
            <span key={tab.id} className="inline-flex items-center">
              <TabsTrigger value={tab.id}>{tab.label}</TabsTrigger>
              <InfoGuide topic="recreate" />
            </span>
          ) : (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ),
        )}
      </TabsList>

      <TabsContent value="recreate">
        <RecreateTab
          business={business}
          onSwitchToScratch={(carry) => void carryPhotoToScratch(carry)}
          onPostCreated={onPostCreated}
        />
      </TabsContent>

      <TabsContent value="scratch">
        <>
    {scratchSurface.showChooser && (
      <div className="mb-4 space-y-3" data-testid="scratch-create-chooser">
        <p className="text-sm font-black text-[#111]">How would you like to create?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setScratchCreateMode('ai_designed')}
              className={`w-full rounded-2xl border-2 p-4 pr-10 text-left transition-colors ${
                scratchCreateMode === 'ai_designed'
                  ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-200'
                  : 'border-[#EDEAE2] bg-white hover:border-indigo-200'
              }`}
              data-testid="scratch-mode-ai-designed"
            >
              <p className="text-sm font-black text-[#111]">AI Designed</p>
              <p className="mt-1 text-xs leading-relaxed text-[#666]">
                Tell us what you want and get complete designs.
              </p>
            </button>
            <div className="absolute right-2 top-2">
              <InfoGuide topic="aiDesigned" />
            </div>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setScratchCreateMode('build_layout')}
              className={`w-full rounded-2xl border-2 p-4 pr-10 text-left transition-colors ${
                scratchCreateMode === 'build_layout'
                  ? 'border-indigo-400 bg-white ring-1 ring-indigo-100'
                  : 'border-[#EDEAE2] bg-[#FAFAF8] hover:border-[#DDD]'
              }`}
              data-testid="scratch-mode-build-layout"
            >
              <p className="text-sm font-black text-[#111]">Build a layout</p>
              <p className="mt-1 text-xs leading-relaxed text-[#666]">
                Choose the format, photo, words and positioning yourself.
              </p>
            </button>
            <div className="absolute right-2 top-2">
              <InfoGuide topic="buildLayout" />
            </div>
          </div>
        </div>
      </div>
    )}
    {scratchSurface.showAiDesigned && (
      <AiDesignedPanel business={business} onPostCreated={onPostCreated} />
    )}
    {scratchSurface.showBuilder && (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className={COMPOSE_STEP_CARD}>
          <StepHeader n={1} title="What are we posting?" />
          <div className="p-4">
            <ComposeOccasionPicker
              categoryId={postCategory}
              subtypeId={postSubtype}
              onCategoryChange={handleCategoryChange}
              onSubtypeChange={handleSubtypeChange}
            />
          </div>
        </div>

        {/* Step 2 - Format & photo */}
        <div className={COMPOSE_STEP_CARD} ref={composeStep2Ref} id="compose-step-2">
          <StepHeader n={2} title="Format & photo" accentDot={formatAccent.dot} />
          <div className="p-4 space-y-4">
            <ComposeAxesPanel
              contentFormat={contentFormat}
              photoSource={photoSource}
              infographicPreset={infographicPreset}
              onFormatChange={handleFormatChange}
              onPhotoSourceChange={handlePhotoSourceChange}
              onPresetChange={handlePresetChange}
            />

            <p
              className="text-[11px] text-[#888]"
              data-testid="compose-credit-hint-step2"
              data-credit-total={totalCredits}
              data-photo-source={photoSource}
              data-ai-designed-background={aiDesignedBackground ? '1' : '0'}
            >
              {formatPhotoSourceCreditHint(creditEstimateInput)}
            </p>

            {contentFormat === 'infographic' &&
              photoSource === 'none' &&
              infographicAiBackgroundEnabled && (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#EDEAE2] bg-[#FAFAF8] px-3.5 py-3 transition-colors hover:border-indigo-200"
                data-testid="compose-ai-designed-background-toggle"
              >
                <input
                  type="checkbox"
                  checked={aiDesignedBackground}
                  onChange={(e) => setAiDesignedBackground(e.target.checked)}
                  className="mt-0.5 accent-[#FFD700]"
                />
                <span className="text-xs text-[#444]">
                  <span className="font-semibold text-[#222]">Designed background (AI)</span>
                  {' - '}
                  Generate a custom frame behind your infographic text. All copy stays in the
                  template overlay - not baked into the image.
                </span>
              </label>
            )}

            {photoSource !== 'none' && (
              <PhotoFieldPicker
                label="Photo"
                selectedUrl={composePhotoUrl}
                canonicalUrl={composePhotoHttpsUrl}
                onSelect={applyComposePhotoSelection}
                jobPhotos={jobPhotos}
                photosLoading={photosLoading}
                selectedJobId={selectedJobId}
                uploading={uploadingPhotoKey === 'compose'}
                onUpload={(file) => handlePhotoUpload('compose', file)}
                tradeCategory={tradeCategoryForPhotos}
                photoSource={photoSource}
                derivedPurpose={derivedAiPurpose}
                onAiPhotoGenerated={() => {
                  setAiPhotoCreditSpent(true)
                  void refreshCreditsWithPulse()
                }}
                onCleanupApplied={() => {
                  setPhotoCleanupApplied(true)
                  void refreshCreditsWithPulse()
                }}
                jobDescription={
                  fieldValues.description?.trim() ||
                  resolveJobDescription(
                    selectedJob,
                    descriptionFallback(postSubtype, business.ai_agent_services),
                  )
                }
                brandColor={business.brand_color}
                businessName={business.name?.trim() || 'Your Business'}
                aiSessionKey={aiPhotoSessionKey}
              />
            )}

            {contentFormat === 'infographic' && infographicContent && (
              <div className="rounded-lg border border-[#EDEAE2] bg-[#FAFAF8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#999] mb-1">
                  AI copy ready
                </p>
                <pre className="text-[11px] text-[#444] whitespace-pre-wrap max-h-40 overflow-auto">
                  {JSON.stringify(infographicContent, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {showComposeJobStep && (
          <div
            className={`${COMPOSE_STEP_CARD}`}
            data-testid="compose-step-3"
          >
            <StepHeader n={3} title="Pick a product or offer" />
            <div className="p-4 space-y-3">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                disabled={jobsLoading}
                className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2.5 text-sm disabled:opacity-60"
              >
                <option value="">None - write my own</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{formatJobLabel(j)}</option>
                ))}
              </select>
              {jobsLoading && (
                <p className="text-xs text-[#888] flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading jobs…
                </p>
              )}
            </div>
          </div>
        )}

        <div
          className={COMPOSE_STEP_CARD}
          data-testid="compose-step-4"
        >
          <StepHeader
            n={scratchStepCustomise}
            title={
              contentFormat === 'scene' || contentFormat === 'quote_card'
                ? 'Customise content'
                : 'Platforms & copy'
            }
          />
          <div className="p-4 space-y-3">
            {contentFormat === 'scene' && (
              <SceneContentFields
                content={sceneContent}
                onChange={setSceneContent}
              />
            )}

            {contentFormat === 'quote_card' && (
              <QuoteCardContentFields
                content={quoteCardContent}
                onChange={setQuoteCardContent}
              />
            )}

            {contentFormat === 'infographic' && (
              <p className="text-xs text-[#666]">
                Copy is generated with AI from your trade and services when you hit Generate.
                {infographicContentLoading ? ' Generating copy…' : ''}
              </p>
            )}

            {hasLogo && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#666]">
                  Logo position (this post)
                </label>
                <LogoCornerPicker value={logoCorner} onChange={setLogoCorner} />
                <p className="mt-1.5 text-[10px] text-[#AAA]">
                  Override for this post - default is in Post defaults above.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#666]">Platforms</label>
              <div className="space-y-2">
                <PlatformToggle
                  label="Instagram (1080×1080)"
                  platform="instagram"
                  connected={connected.instagram}
                  selected={selectedPlatforms.includes('instagram')}
                  onToggle={() => togglePlatform('instagram')}
                />
                <PlatformToggle
                  label="Facebook (1200×630)"
                  platform="facebook"
                  connected={connected.facebook}
                  selected={selectedPlatforms.includes('facebook')}
                  onToggle={() => togglePlatform('facebook')}
                />
                <PlatformToggle
                  label="Google Business (1080×1350)"
                  platform="gmb"
                  connected={connected.gmb}
                  selected={selectedPlatforms.includes('gmb')}
                  onToggle={() => togglePlatform('gmb')}
                />
              </div>
              {selectedPlatforms.length === 0 && anyConnected && (
                <p className="mt-2 text-xs text-amber-700">Select connected platforms for auto-posting, or generate and post manually below.</p>
              )}
              {!anyConnected && (
                <>
                  <p className="mt-2 text-xs text-[#666]">
                    No platforms connected - generate your image, download it, copy the caption, and post in Instagram or Facebook yourself.
                  </p>
                  <Link
                    href="/dashboard/social/connections"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#FFD700] hover:underline"
                  >
                    <Zap className="h-3 w-3" /> Connect platforms for auto-posting →
                  </Link>
                </>
              )}
              {anyConnected && selectedPlatforms.length === 0 && (
                <Link
                  href="/dashboard/social/connections"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#888] hover:underline"
                >
                  Manage connections →
                </Link>
              )}
            </div>

            {contentFormat === 'scene' && (
            <div className="border-t border-[#F0EDE5] pt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-[#666]">Text position</p>
                <SceneStackLayoutPicker
                  value={stackLayoutFromStyles(textStyles)}
                  onChange={handleStackLayoutChange}
                />
                <p className="mt-1.5 text-[10px] text-[#AAA]">
                  Applies to this post only. Change defaults in Post defaults above.
                </p>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold text-[#666]">Text style</p>
                <SocialTextStyleEditor
                  inline
                  styles={textStyles}
                  onChange={handleTextStyleChange}
                  elements={['headline', 'tagline']}
                  fontPreviewPhrase={business.name}
                  hint="Applies to this post only. Change defaults in Post defaults above."
                />
              </div>
            </div>
            )}
          </div>
        </div>

        <div className={COMPOSE_STEP_CARD}>
          <StepHeader
            n={scratchStepGenerate}
            title={generateStepLabel}
            accentDot={formatAccent.dot}
          />
          <div className="p-4 space-y-3">
            <button
              type="button"
              disabled={
                generating ||
                uploadingPhotoKey === 'compose' ||
                (contentFormat === 'scene' &&
                  (!sceneContent.headline.trim() ||
                    (photoSource !== 'none' && !hasServerComposePhoto()))) ||
                (contentFormat === 'quote_card' &&
                  (!quoteCardContent.quoteText.trim() ||
                    !quoteCardContent.customerName.trim() ||
                    (photoSource !== 'none' && !hasServerComposePhoto()))) ||
                (contentFormat === 'infographic' &&
                  photoSource !== 'none' &&
                  !hasServerComposePhoto())
              }
              onClick={generateImage}
              className="w-full rounded-2xl bg-[#FFD700] py-3.5 text-sm font-black text-black shadow-md transition-all duration-200 hover:bg-yellow-400 hover:shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating your post…</>
              ) : contentFormat === 'infographic' ? (
                <><Sparkles className="h-4 w-4" /> Generate infographic</>
              ) : contentFormat === 'quote_card' ? (
                <><Sparkles className="h-4 w-4" /> Generate quote card</>
              ) : (
                <><Camera className="h-4 w-4" /> Generate image</>
              )}
            </button>
            {(contentFormat === 'infographic' ||
              contentFormat === 'scene' ||
              contentFormat === 'quote_card') && (
              <p
                className="text-[11px] text-[#888]"
                data-testid="compose-credit-hint-step5"
                data-credit-total={totalCredits}
                data-photo-source={photoSource}
              >
                {formatComposeGenerateStepCreditLine(creditEstimateInput)}
                {' '}
                {totalCredits > 1 && (
                  <span className="text-[#AAA]">
                    ({formatComposeTotalCreditLine(creditEstimateInput)})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {imageUrl && (
          <div
            ref={postReadyRef}
            className={`${COMPOSE_STEP_CARD} ring-2 ring-[#FFD700]/35 border-[#FFD700]/60 scroll-mt-4`}
            data-testid="compose-post-ready"
          >
            <StepHeader n={scratchStepReady} title="Your post is ready" accentDot={formatAccent.dot} />
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadImage}
                  className="flex items-center gap-1.5 rounded-xl bg-[#111] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#222] hover:shadow-md"
                >
                  <Download className="h-3.5 w-3.5" /> Download image
                </button>
                <InfoGuide topic="download" />
                <button
                  type="button"
                  onClick={copyCaption}
                  disabled={!caption.trim()}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-[#111] bg-white px-3.5 py-2.5 text-xs font-bold text-[#111] transition-all duration-200 hover:bg-[#FAFAF7] disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy caption
                </button>
                <button
                  type="button"
                  onClick={generateImage}
                  disabled={generating}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 transition-all duration-200 hover:bg-indigo-100 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => { setImageUrl(null); setCaptions([]); setCaption(''); setRenderId(null) }}
                  className="rounded-xl border border-dashed border-[#CCC] bg-[#FAFAF7] px-3.5 py-2.5 text-xs font-semibold text-[#666] transition-all duration-200 hover:border-[#999] hover:text-[#333]"
                >
                  Try a different style
                </button>
              </div>

              {manualPostGuide.platforms.length > 0 && (
                <SocialManualPostGuide
                  platforms={manualPostGuide.platforms}
                  showApprovalNote={manualPostGuide.showApprovalNote}
                />
              )}

              {captionLoading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-[#888]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#FFD700]" />
                  Writing captions…
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadCaptions()}
                  disabled={captionLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#888] hover:text-black"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Regenerate captions
                </button>
                <InfoGuide topic="regenerateCaption" />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-0.5 text-xs font-semibold text-[#666]">
                  Your caption
                  <InfoGuide topic="caption" />
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => {
                    weekAheadCaptionLocked.current = false
                    setCaption(e.target.value)
                  }}
                  onBlur={() => {
                    void persistRenderCaption(renderId, caption)
                  }}
                  rows={5}
                  placeholder="Edit your caption…"
                  className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                />
                <p className={`mt-1 text-xs ${charCount > charLimit ? 'text-red-600 font-semibold' : 'text-[#AAA]'}`}>
                  {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters ({captionPlatform.toUpperCase()})
                </p>
              </div>

              {anyConnected && selectedPlatforms.some((p) => connected[p]) && (
                <>
                  <div className="border-t border-[#F0EDE5] pt-3 space-y-3">
                    <p className="flex items-center gap-0.5 text-xs font-semibold text-[#666]">
                      Post via connected platforms
                      <InfoGuide topic="publishTo" />
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      {(['now', 'schedule', 'draft'] as const).map((m) => (
                        <span key={m} className="inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => setScheduleMode(m)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                              scheduleMode === m ? 'bg-[#FFD700] text-black' : 'bg-[#F0EDE5] text-[#666]'
                            }`}
                          >
                            {m === 'now' ? 'Post now' : m === 'schedule' ? 'Schedule' : 'Save draft'}
                          </button>
                          {m === 'now' ? <InfoGuide topic="postNow" /> : null}
                          {m === 'schedule' ? <InfoGuide topic="schedule" /> : null}
                        </span>
                      ))}
                    </div>
                    {scheduleMode === 'schedule' && (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                        />
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={submitting || !caption.trim()}
                      onClick={submitPost}
                      className="w-full rounded-xl bg-black py-3.5 text-sm font-black text-white hover:bg-[#222] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {scheduleMode === 'now' ? 'Post now' : scheduleMode === 'schedule' ? 'Schedule post' : 'Save draft'}
                    </button>
                  </div>

                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-[#EDEAE2]" />
                    <span className="mx-3 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#AAA]">or</span>
                    <div className="flex-grow border-t border-[#EDEAE2]" />
                  </div>
                </>
              )}

              <p className="text-xs text-[#888]">
                Posted outside Vendl? Save it to your history without connecting a platform.
              </p>
              <button
                type="button"
                disabled={submitting || !caption.trim()}
                onClick={submitManualPost}
                className="w-full rounded-xl border border-[#EDEAE2] bg-[#FAFAF7] py-3.5 text-sm font-black text-[#444] hover:border-[#FFD700] hover:bg-[#FFFBEA] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Mark as posted manually
              </button>
            </div>
          </div>
        )}
      </div>

      <ComposePreviewPanel
        platform={previewPlatform}
        contentFormat={contentFormat}
        imageUrl={imageUrl}
        renderId={renderId}
        credits={renderCredits}
        creditsLoading={renderCreditsLoading}
        creditsPulseKey={creditsPulseKey}
      />
    </div>
    )}
        </>
      </TabsContent>
    </Tabs>
      )}
    </div>
  )
}
