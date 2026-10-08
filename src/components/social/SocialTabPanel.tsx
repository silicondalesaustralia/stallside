'use client'

import dynamic from 'next/dynamic'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { PostSettingsPanel } from '@/components/social/PostSettingsPanel'
import { shouldShowSocialPostDefaultsPanel } from '@/lib/social/socialPostDefaultsVisibility'
import type { SocialWorkspaceBusiness } from '@/lib/social/useSocialWorkspace'

const CreateTab = dynamic(
  () => import('@/components/social/CreateTab').then((m) => ({ default: m.CreateTab })),
  { loading: () => <SocialTabChunkLoading /> },
)
const PlannerTab = dynamic(
  () => import('@/components/social/PlannerTab').then((m) => ({ default: m.PlannerTab })),
  { loading: () => <SocialTabChunkLoading /> },
)
const LibraryTab = dynamic(
  () => import('@/components/social/LibraryTab').then((m) => ({ default: m.LibraryTab })),
  { loading: () => <SocialTabChunkLoading /> },
)
const SocialCalendarTab = dynamic(
  () => import('@/components/social/SocialCalendarTab').then((m) => ({ default: m.SocialCalendarTab })),
  { loading: () => <SocialTabChunkLoading /> },
)

export type SocialShellTab = 'create' | 'planner' | 'library' | 'calendar'

export type SocialProductVariant = 'stitchedup' | 'tradiespost'

type SocialTabPanelProps = {
  tab: SocialShellTab
  variant?: SocialProductVariant
  business: SocialWorkspaceBusiness | null
  posts: import('@/lib/social/useSocialWorkspace').SocialWorkspacePost[]
  loadError: string | null
  loadData: () => void
  setBusiness: React.Dispatch<React.SetStateAction<SocialWorkspaceBusiness | null>>
  infographicAiBackgroundEnabled: boolean
  aiDesignedEnabled: boolean
  connectionsHref?: string
  /** Planner deep-link params */
  weekPlanId?: string | null
  buildWeek?: boolean
  plannerWeekStart?: string | null
  calendarWeekStart?: string | null
  calendarPostId?: string | null
  initialJobId?: string | null
  agentSuggestionId?: string | null
  initialComposeStep?: string | null
  onOpenWeekPlan?: (id: string) => void
  onCloseWeekPlan?: () => void
  onClearCalendarPostDeepLink?: () => void
  onViewLibrary?: () => void
}

function SocialTabChunkLoading() {
  return (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#F5C518]" aria-label="Loading" />
    </div>
  )
}

function SocialLoadError({
  loadError,
  onRetry,
}: {
  loadError: string | null
  onRetry: () => void
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-white p-12 text-center">
      <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
      <p className="mb-1 font-semibold text-zinc-700">Could not load business data</p>
      {loadError && (
        <p className="mx-auto mb-3 max-w-sm rounded-lg bg-red-50 px-4 py-2 font-mono text-xs text-red-600">
          {loadError}
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-[#F5C518] px-4 py-2 text-sm font-black text-zinc-900 hover:bg-yellow-400 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  )
}

export function SocialTabPanel({
  tab,
  variant = 'stitchedup',
  business,
  posts,
  loadError,
  loadData,
  setBusiness,
  infographicAiBackgroundEnabled,
  aiDesignedEnabled,
  weekPlanId,
  buildWeek,
  plannerWeekStart,
  calendarWeekStart,
  calendarPostId,
  initialJobId,
  agentSuggestionId,
  initialComposeStep,
  onOpenWeekPlan,
  onCloseWeekPlan,
  onClearCalendarPostDeepLink,
  onViewLibrary,
}: SocialTabPanelProps) {
  return (
    <>
      {shouldShowSocialPostDefaultsPanel(tab) && business && (
        <PostSettingsPanel
          business={business}
          variant={variant}
          onUpdate={(patch) => setBusiness((b) => (b ? { ...b, ...patch } : b))}
        />
      )}

      {tab === 'create' &&
        (business ? (
          <CreateTab
            business={business}
            initialJobId={initialJobId}
            agentSuggestionId={agentSuggestionId}
            initialComposeStep={initialComposeStep}
            infographicAiBackgroundEnabled={infographicAiBackgroundEnabled}
            aiDesignedEnabled={aiDesignedEnabled}
            onPostCreated={loadData}
            onViewLibrary={onViewLibrary}
            onComposePrefsUpdate={(patch) =>
              setBusiness((b) => (b ? { ...b, ...patch } : b))
            }
          />
        ) : (
          <SocialLoadError loadError={loadError} onRetry={loadData} />
        ))}

      {tab === 'planner' && (
        <PlannerTab
          autoOpenWizard={Boolean(buildWeek && tab === 'planner' && !weekPlanId)}
          weekPlanId={weekPlanId}
          business={business}
          variant={variant}
          onOpenWeekPlan={onOpenWeekPlan ?? (() => {})}
          onCloseWeekPlan={onCloseWeekPlan ?? (() => {})}
          onPostsChanged={loadData}
        />
      )}

      {tab === 'library' && (
        <LibraryTab
          business={business}
          posts={posts}
          variant={variant}
          createHref={variant === 'tradiespost' ? '/dashboard/social/create' : '/dashboard/social?tab=create'}
          plannerHref={variant === 'tradiespost' ? '/dashboard/social/planner?buildWeek=1' : '/dashboard/social?tab=planner'}
          onPostCreated={loadData}
        />
      )}

      {tab === 'calendar' && (
        <SocialCalendarTab
          posts={posts}
          timeZone={business?.timezone ?? 'Australia/Sydney'}
          initialWeekStart={calendarWeekStart ?? plannerWeekStart}
          initialPostId={calendarPostId}
          variant={variant}
          plannerHref={variant === 'tradiespost' ? '/dashboard/social/planner?buildWeek=1' : '/dashboard/social?tab=planner'}
          createHref={variant === 'tradiespost' ? '/dashboard/social/create' : '/dashboard/social?tab=create'}
          onRefresh={loadData}
          onClearPostDeepLink={onClearCalendarPostDeepLink}
        />
      )}
    </>
  )
}

export function SocialTabLoading({ variant = 'stitchedup' }: { variant?: SocialProductVariant }) {
  const accent = variant === 'tradiespost' ? 'border-t-[#F5C518]' : 'border-t-[#FFD100]'
  return (
        <div className="flex h-64 items-center justify-center" {...(variant === 'tradiespost' ? { 'data-tp-theme': '' } : {})}>
      {variant === 'tradiespost' ? (
        <div
          className={`h-8 w-8 animate-spin rounded-full border-2 border-[#E4E4E7] ${accent}`}
          role="status"
          aria-label="Loading"
        />
      ) : (
        <Loader2 className="h-8 w-8 animate-spin text-[#F5C518]" />
      )}
    </div>
  )
}
