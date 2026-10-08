'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Sparkles, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { BuildMyWeekWizard } from '@/components/week-ahead/BuildMyWeekWizard'
import { WeekPlanReview } from '@/components/week-ahead/WeekPlanReview'
import { GenerateWeekConfirmModal } from '@/components/week-ahead/GenerateWeekConfirmModal'
import { WeekPlanGeneratedReview } from '@/components/week-ahead/WeekPlanGeneratedReview'
import { logWeekBuilderAnalytics } from '@/lib/social/weekPlan/weekPlanAnalytics'
import {
  DASHBOARD_CTA,
  DASHBOARD_ICON,
  DASHBOARD_ICON_WRAP,
} from '@/components/dashboard/DashboardWidgetCard'
import {
  formatWeekRangeCompact,
  formatWeekRangeHeading,
  formatWeekRangeWithContext,
  mondayOfCurrentWeek,
  nextWeekMondayDateKey,
} from '@/lib/social/weekPlan/weekIdentity'
import {
  weekPlanDisplayStatus,
  weekPlanStatusDetail,
} from '@/lib/social/weekPlan/weekPlanDisplayStatus'
import type { WeekPlanListEntry } from '@/lib/social/weekPlan/listWeekPlanHistory'
import type { ActiveWeekPlanSummary } from '@/lib/social/weekPlan/weekPlanWeekSelection'
import type { WeekPlanGenerationProgress } from '@/lib/social/weekPlan/weekPlanGenerationProgress'
import type { WeekPlanItemRow, WeekPlanPlatform, WeekPlanRow } from '@/lib/social/weekPlan/types'

type WeekPlanContext = {
  weekStartDate: string
  timeZone: string
  defaultPlatforms: WeekPlanPlatform[]
  plan: WeekPlanRow | null
  items: WeekPlanItemRow[]
  itemCount: number
}

type Props = {
  autoOpenWizard?: boolean
  /** Hide the surface card - modals only (Social Planner tab). */
  showCard?: boolean
  /** Planner tab: reload week context when user picks a week from history. */
  activeWeekStart?: string | null
  /** Increment to open wizard from parent CTA. */
  openWizardSignal?: number
  /** Increment to open review modal for activeWeekStart. */
  openReviewSignal?: number
  /** Open review in read-only history mode (past weeks). */
  viewHistoryReadOnly?: boolean
  /** Navigate to canonical Planner production desk. */
  /** Default week to pre-select when opening Build My Week (e.g. Build another week). */
  suggestedWeekStart?: string | null
  onOpenProductionDesk?: (planId: string) => void
  onPlanChange?: () => void
  /** Week Ahead command-centre module - compact card, not the marketing banner. */
  moduleLayout?: boolean
}

export function BuildMyWeekPanel({
  autoOpenWizard = false,
  showCard = true,
  activeWeekStart = null,
  openWizardSignal = 0,
  openReviewSignal = 0,
  viewHistoryReadOnly = false,
  onPlanChange,
  onOpenProductionDesk,
  suggestedWeekStart = null,
  moduleLayout = false,
}: Props) {
  const { toast } = useToast()
  const [ctx, setCtx] = useState<WeekPlanContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [generatedReviewOpen, setGeneratedReviewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preflight, setPreflight] = useState<{
    itemCount: number
    previewCount: number
    creditsRequired: number
  } | null>(null)
  const [generateBusy, setGenerateBusy] = useState(false)
  const [progress, setProgress] = useState<WeekPlanGenerationProgress | null>(null)
  const [autoWizardHandled, setAutoWizardHandled] = useState(false)
  const [historyReadOnly, setHistoryReadOnly] = useState(false)
  const [plannerHistory, setPlannerHistory] = useState<{
    timeZone: string
    currentWeekStartDate: string
    nextWeekStartDate: string
    upcoming: WeekPlanListEntry[]
  } | null>(null)

  const activePlans: ActiveWeekPlanSummary[] = useMemo(
    () =>
      (plannerHistory?.upcoming ?? []).map((entry) => ({
        weekStartDate: entry.plan.week_start_date,
        planId: entry.plan.id,
        status: entry.plan.status,
        generationStatus: entry.plan.generation_status,
      })),
    [plannerHistory],
  )

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/social/week-plan/history')
      if (!res.ok) return
      const json = await res.json()
      setPlannerHistory({
        timeZone: json.timeZone,
        currentWeekStartDate: json.currentWeekStartDate,
        nextWeekStartDate: json.nextWeekStartDate,
        upcoming: json.upcoming ?? [],
      })
    } catch {
      // non-blocking
    }
  }, [])

  const load = useCallback(async (weekStart?: string | null) => {
    setLoading(true)
    try {
      const qs = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : ''
      const res = await fetch(`/api/social/week-plan${qs}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      setCtx(await res.json())
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not load social week plan', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadProgress = useCallback(async (planId: string) => {
    try {
      const res = await fetch(`/api/social/week-plan/${planId}/generation-status`)
      if (!res.ok) return
      const json = await res.json()
      setProgress(json.progress)
      setCtx((prev) =>
        prev
          ? {
              ...prev,
              plan: json.plan,
              items: json.items,
              itemCount: json.items.length,
            }
          : prev,
      )
    } catch {
      // polling - ignore
    }
  }, [])

  useEffect(() => {
    void load(activeWeekStart)
    void loadHistory()
  }, [load, loadHistory, activeWeekStart])

  useEffect(() => {
    if (!autoOpenWizard || autoWizardHandled || loading) return
    setAutoWizardHandled(true)
    setWizardOpen(true)
  }, [autoOpenWizard, autoWizardHandled, loading])

  useEffect(() => {
    if (openWizardSignal <= 0) return
    openWizard()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openWizardSignal])

  useEffect(() => {
    if (openReviewSignal <= 0 || !ctx) return
    setHistoryReadOnly(viewHistoryReadOnly || ctx.plan?.status === 'archived')
    setReviewOpen(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openReviewSignal])

  const plan = ctx?.plan
  const items = ctx?.items ?? []
  const itemCount = ctx?.itemCount ?? 0
  const timeZone = ctx?.timeZone ?? 'Australia/Sydney'
  const displayWeekStart = plan?.week_start_date ?? ctx?.weekStartDate ?? ''
  const isDraft = plan?.status === 'draft'
  const isApproved = plan?.status === 'plan_approved'
  const genStatus = plan?.generation_status ?? 'not_started'
  const isGenerating = genStatus === 'queued' || genStatus === 'generating'
  const isReady = genStatus === 'ready'
  const isPartialFailed = genStatus === 'partial_failed'

  useEffect(() => {
    if (!plan?.id || !isGenerating) return
    void loadProgress(plan.id)
    const t = window.setInterval(() => void loadProgress(plan.id), 5000)
    return () => window.clearInterval(t)
  }, [plan?.id, isGenerating, loadProgress])

  function openWizard() {
    logWeekBuilderAnalytics('week_builder_opened', {})
    void loadHistory()
    setWizardOpen(true)
  }

  function handleViewPlan(planId: string) {
    setWizardOpen(false)
    if (onOpenProductionDesk) {
      onOpenProductionDesk(planId)
    }
  }

  async function handleContinuePlan(planId: string) {
    setWizardOpen(false)
    try {
      const res = await fetch(`/api/social/week-plan/${planId}`)
      if (!res.ok) throw new Error('Could not load plan')
      const json = await res.json()
      setCtx((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          plan: json.plan,
          items: json.items,
          itemCount: json.items.length,
          weekStartDate: json.plan.week_start_date,
          timeZone: json.timeZone ?? prev.timeZone,
        }
      })
      setHistoryReadOnly(false)
      setReviewOpen(true)
    } catch {
      handleViewPlan(planId)
    }
  }

  function handleEditPlan(planId: string) {
    setWizardOpen(false)
    handleViewPlan(planId)
  }

  function openReview() {
    setHistoryReadOnly(false)
    setReviewOpen(true)
  }

  async function openGenerateConfirm() {
    if (!plan) return
    try {
      const res = await fetch(`/api/social/week-plan/${plan.id}/generate`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not load generation cost')
      setPreflight({
        itemCount: json.itemCount,
        previewCount: json.previewCount,
        creditsRequired: json.creditsRequired,
      })
      setConfirmOpen(true)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not start generation', 'error')
    }
  }

  async function confirmGenerate() {
    if (!plan) return
    setGenerateBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${plan.id}/generate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Generation failed')
      setConfirmOpen(false)
      toast('Creating your week - you can leave this page', 'success')
      await loadProgress(plan.id)
      setReviewOpen(true)
      onPlanChange?.()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Generation failed', 'error')
    } finally {
      setGenerateBusy(false)
    }
  }

  async function retryFailed() {
    if (!plan) return
    setGenerateBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${plan.id}/retry-failed`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Retry failed')
      toast('Retrying failed posts', 'success')
      await loadProgress(plan.id)
      onPlanChange?.()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Retry failed', 'error')
    } finally {
      setGenerateBusy(false)
    }
  }

  function handlePlanBuilt(result: { plan: WeekPlanRow; items: WeekPlanItemRow[] }) {
    setCtx((prev) =>
      prev
        ? {
            ...prev,
            plan: result.plan,
            items: result.items,
            itemCount: result.items.length,
            weekStartDate: result.plan.week_start_date,
          }
        : prev,
    )
    setWizardOpen(false)
    setReviewOpen(true)
    toast('Your social week plan is ready', 'success')
    onPlanChange?.()
  }

  function handlePlanUpdated(planRow: WeekPlanRow, nextItems: WeekPlanItemRow[]) {
    setCtx((prev) =>
      prev ? { ...prev, plan: planRow, items: nextItems, itemCount: nextItems.length } : prev,
    )
    onPlanChange?.()
  }

  const weekDateHeading = displayWeekStart
    ? formatWeekRangeHeading(displayWeekStart, timeZone)
    : ''
  const weekDateCompact = displayWeekStart
    ? formatWeekRangeCompact(displayWeekStart, timeZone)
    : ''
  const weekDateContext = displayWeekStart
    ? formatWeekRangeWithContext(displayWeekStart, timeZone)
    : ''

  const displayStatus = plan ? weekPlanDisplayStatus(plan) : null
  const statusDetail = plan ? weekPlanStatusDetail(plan, items) : null

  let statusLine = 'Plan and create your social posts for next week.'
  let helperLine: string | null = null
  let ctaLabel = '✨ Build My Week'
  let ctaAction: () => void = openWizard
  let secondaryCta: { label: string; action: () => void } | null = null

  if (plan && isDraft && itemCount > 0) {
    statusLine = `${itemCount} post${itemCount === 1 ? '' : 's'} planned`
    ctaLabel = 'Continue building'
    ctaAction = openReview
  } else if (plan && isDraft && itemCount === 0) {
    statusLine = 'Finish building your plan'
    ctaLabel = 'Continue building'
    ctaAction = openWizard
  } else if (isApproved && genStatus === 'not_started') {
    statusLine = `${itemCount} post${itemCount === 1 ? '' : 's'} ready`
    helperLine = 'Your plan is approved. Generate 3 designs for each post when you\'re ready.'
    ctaLabel = '✨ Generate My Week'
    ctaAction = () => void openGenerateConfirm()
    secondaryCta = { label: 'Edit plan', action: openReview }
  } else if (isApproved && isGenerating) {
    const ready = progress?.generated ?? items.filter((i) => i.generation_status === 'generated').length
    statusLine = `${displayStatus}${statusDetail ? ` - ${statusDetail}` : ''}`
    helperLine = 'You can leave while we finish your posts.'
    ctaLabel = 'View progress'
    ctaAction = openReview
  } else if (isApproved && isReady) {
    statusLine = `${itemCount} post${itemCount === 1 ? '' : 's'} ready to review`
    helperLine = `${items.reduce((n, i) => n + (i.variant_previews?.length ?? 0), 0)} designs created`
    ctaLabel = 'Review My Week'
    ctaAction = () => {
      if (plan && onOpenProductionDesk) {
        onOpenProductionDesk(plan.id)
      } else {
        setGeneratedReviewOpen(true)
      }
    }
    secondaryCta = { label: 'View plan', action: () => plan && onOpenProductionDesk?.(plan.id) }
  } else if (isApproved && isPartialFailed) {
    statusLine = `${displayStatus}${statusDetail ? ` - ${statusDetail}` : ''}`
    ctaLabel = 'Review progress'
    ctaAction = openReview
    secondaryCta = { label: 'Retry failed', action: () => void retryFailed() }
  } else if (isApproved) {
    statusLine = `${itemCount} post${itemCount === 1 ? '' : 's'} ready to generate`
    ctaLabel = 'View plan'
    ctaAction = openReview
  }

  const plannerHref = plan
    ? `/dashboard/social?tab=planner&weekPlanId=${encodeURIComponent(plan.id)}`
    : '/dashboard/social?tab=planner'

  return (
    <>
      {showCard && (
        <section
          className={
            moduleLayout
              ? 'min-w-0 rounded-xl border border-[#FFD100]/30 bg-white p-5 shadow-elevation-rest'
              : 'mb-8 rounded-2xl border border-[#FFD100]/40 bg-gradient-to-r from-[#FFFBEA] to-white p-5 shadow-sm'
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={moduleLayout ? DASHBOARD_ICON_WRAP : 'rounded-lg bg-[#FFD100]/20 p-2'}>
                <Sparkles className={moduleLayout ? DASHBOARD_ICON : 'h-5 w-5 text-[#886600]'} />
              </div>
              <div>
                {moduleLayout ? (
                  <>
                    <h2 className="text-base font-semibold text-gray-900">Plan your social week</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {loading ? 'Loading…' : weekDateCompact || weekDateHeading}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {loading ? '' : `${itemCount} post${itemCount === 1 ? '' : 's'} planned`}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {loading
                        ? ''
                        : itemCount === 0
                          ? `Build your content plan for ${weekDateCompact || 'this week'}.`
                          : statusLine}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#886600]">
                      Next week
                    </p>
                    <h2 className="text-lg font-bold text-gray-900">
                      {loading ? 'Loading…' : weekDateCompact || weekDateHeading}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {loading ? '' : plan ? statusLine : weekDateContext}
                    </p>
                    {!loading && !plan && (
                      <p className="mt-1 text-xs text-gray-500">
                        Tell us what you want to promote and StitchedUp will plan your posts for the week.
                      </p>
                    )}
                    {helperLine && (
                      <p className="mt-2 text-xs text-[#555]">{helperLine}</p>
                    )}
                    {isApproved && genStatus === 'not_started' && itemCount > 0 && (
                      <p className="mt-2 text-xs text-[#666]">
                        {itemCount} posts × 3 designs · Cost: {itemCount} render{itemCount === 1 ? '' : 's'}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                disabled={loading || generateBusy}
                onClick={ctaAction}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-black hover:bg-yellow-400 disabled:opacity-50 transition-colors"
              >
                {loading || generateBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {plan ? ctaLabel : 'Build My Week'}
              </button>
              <Link
                href={plan ? plannerHref : '/dashboard/social?tab=planner'}
                className={
                  moduleLayout
                    ? `text-center ${DASHBOARD_CTA}`
                    : 'text-center text-xs font-bold text-[#666] hover:text-black underline-offset-2 hover:underline'
                }
              >
                Open Social Planner
              </Link>
              {!moduleLayout && secondaryCta && (
                <button
                  type="button"
                  disabled={generateBusy}
                  onClick={secondaryCta.action}
                  className="text-xs font-bold text-[#666] hover:text-black underline-offset-2 hover:underline"
                >
                  {secondaryCta.label}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {wizardOpen && ctx && (
        <BuildMyWeekWizard
          timeZone={plannerHistory?.timeZone ?? ctx.timeZone}
          currentWeekStart={
            plannerHistory?.currentWeekStartDate ?? mondayOfCurrentWeek(ctx.timeZone)
          }
          nextWeekStart={
            plannerHistory?.nextWeekStartDate ?? nextWeekMondayDateKey(ctx.timeZone)
          }
          activePlans={activePlans}
          initialSelectedWeekStart={suggestedWeekStart}
          defaultPlatforms={ctx.defaultPlatforms}
          initialWizard={plan?.wizard_answers}
          onClose={() => setWizardOpen(false)}
          onComplete={handlePlanBuilt}
          onViewPlan={handleViewPlan}
          onContinuePlan={handleContinuePlan}
          onEditPlan={handleEditPlan}
        />
      )}

      {reviewOpen && ctx && plan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="relative flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setReviewOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[#888] hover:bg-[#F5F3ED] z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-y-auto p-5 pt-12">
              <WeekPlanReview
                plan={plan}
                items={items}
                timeZone={ctx.timeZone}
                weekStartDate={plan.week_start_date}
                progress={progress}
                historyMode={historyReadOnly}
                onUpdated={handlePlanUpdated}
                onClose={() => setReviewOpen(false)}
                onReload={() => void load(activeWeekStart)}
                onGenerate={() => void openGenerateConfirm()}
                onRetryFailed={() => void retryFailed()}
                generateBusy={generateBusy}
              />
            </div>
          </div>
        </div>
      )}

      {generatedReviewOpen && ctx && plan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="relative flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setGeneratedReviewOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[#888] hover:bg-[#F5F3ED] z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-y-auto p-5 pt-12 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#886600]">Your week is ready</p>
                <h3 className="text-xl font-black text-black">{weekDateHeading}</h3>
                <p className="mt-1 text-sm text-[#555]">
                  {itemCount} post{itemCount === 1 ? '' : 's'} ·{' '}
                  {items.reduce((n, i) => n + (i.variant_previews?.length ?? 0), 0)} designs created
                </p>
              </div>
              <WeekPlanGeneratedReview items={items} timeZone={ctx.timeZone} />
              <button
                type="button"
                onClick={() => setGeneratedReviewOpen(false)}
                className="w-full rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <GenerateWeekConfirmModal
        open={confirmOpen}
        itemCount={preflight?.itemCount ?? itemCount}
        previewCount={preflight?.previewCount ?? itemCount * 3}
        creditsRequired={preflight?.creditsRequired ?? itemCount}
        busy={generateBusy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmGenerate()}
      />
    </>
  )
}
