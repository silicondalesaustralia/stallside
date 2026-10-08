'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronLeft, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { GenerateWeekConfirmModal } from '@/components/week-ahead/GenerateWeekConfirmModal'
import { WeekPlanProductionCard } from '@/components/social/WeekPlanProductionCard'
import {
  formatWeekRangeHeading,
} from '@/lib/social/weekPlan/weekIdentity'
import { weekPlanDisplayStatus } from '@/lib/social/weekPlan/weekPlanDisplayStatus'
import type { WeekProductionProgress } from '@/lib/social/weekPlan/weekPlanProduction'
import type { WeekPlanItemRow, WeekPlanRow } from '@/lib/social/weekPlan/types'
import {
  defaultLibrarySelectedPlatforms,
  socialConnectionsFromBusiness,
  type SocialConnectionState,
} from '@/lib/social/libraryPublish'

type PlanDetailResponse = {
  plan: WeekPlanRow
  items: WeekPlanItemRow[]
  timeZone: string
  progress: WeekProductionProgress
  previewCount: number
  readOnly: boolean
  scheduledPosts: Record<
    string,
    {
      scheduled_for: string | null
      platforms: string[]
      status: string
      publishing_mode?: string
      publishState?: string
    }
  >
  itemPublishStates?: Record<string, string>
}

type BusinessConnections = {
  facebook_page_id?: string | null
  instagram_account_id?: string | null
  gmb_account_id?: string | null
}

type Props = {
  weekPlanId: string
  business: BusinessConnections
  onBack: () => void
  onPlanUpdated?: () => void
  onPostsChanged?: () => void
  onBuildAnotherWeek?: (afterWeekStart: string) => void
}

export function PlannerWeekDetail({
  weekPlanId,
  business,
  onBack,
  onPlanUpdated,
  onPostsChanged,
  onBuildAnotherWeek,
}: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<PlanDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [weekActionBusy, setWeekActionBusy] = useState(false)
  const [generateBusy, setGenerateBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preflight, setPreflight] = useState<{
    itemCount: number
    previewCount: number
    creditsRequired: number
  } | null>(null)

  const connected: SocialConnectionState = socialConnectionsFromBusiness(business)

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    try {
      const res = await fetch(`/api/social/week-plan/${weekPlanId}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      setData(await res.json())
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not load week', 'error')
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [weekPlanId, toast])

  useEffect(() => {
    void load()
  }, [load])

  async function openGenerateConfirm() {
    try {
      const res = await fetch(`/api/social/week-plan/${weekPlanId}/generate`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not load generation cost')
      if (json.aiDesignedEnabled === false) {
        throw new Error('Image generation is not turned on for this environment')
      }
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
    setGenerateBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${weekPlanId}/generate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Generation failed')
      setConfirmOpen(false)
      toast('Creating your week — you can leave this page', 'success')
      await load({ silent: true })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Generation failed', 'error')
    } finally {
      setGenerateBusy(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('generate') !== '1' || !data) return
    if (data.plan.generation_status !== 'not_started' || data.plan.status !== 'plan_approved') return
    void openGenerateConfirm()
    const url = new URL(window.location.href)
    url.searchParams.delete('generate')
    router.replace(`${url.pathname}?${url.searchParams.toString()}`)
    // openGenerateConfirm is stable enough for this deep-link; avoid re-firing on every data poll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, data?.plan.id, data?.plan.status, data?.plan.generation_status])

  useEffect(() => {
    const gen = data?.plan.generation_status
    if (gen !== 'queued' && gen !== 'generating') return
    const timer = window.setInterval(() => {
      void load({ silent: true })
    }, 4000)
    return () => window.clearInterval(timer)
  }, [data?.plan.generation_status, load])

  function handleItemUpdated(item: WeekPlanItemRow) {
    setData((prev) =>
      prev
        ? { ...prev, items: prev.items.map((i) => (i.id === item.id ? item : i)) }
        : prev,
    )
    onPlanUpdated?.()
    void load()
  }

  async function resetSelections() {
    if (!confirm('Reset selections for this week? Previews and captions stay. Scheduled posts that have not been published will be cancelled.')) {
      return
    }
    setWeekActionBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${weekPlanId}/reset-selections`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Reset failed')
      const s = json.summary
      toast(
        `Reset ${s.selectionsReset} selection(s), cancelled ${s.schedulesCancelled} schedule(s), preserved ${s.publishedPreserved} published`,
        'success',
      )
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Reset failed', 'error')
    } finally {
      setWeekActionBusy(false)
    }
  }

  async function rebuildWeek() {
    if (
      !confirm(
        'Rebuild this week? All designs, captions and schedules will be cleared. Published history stays. New generation will use renders.',
      )
    ) {
      return
    }
    setWeekActionBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${weekPlanId}/rebuild`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Rebuild failed')
      toast('Week reset - edit your plan and generate again', 'success')
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Rebuild failed', 'error')
    } finally {
      setWeekActionBusy(false)
    }
  }
  async function approveAllSelected() {
    if (!data) return
    setBulkBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${weekPlanId}/approve-all-selected`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Bulk approve failed')
      if (json.errors?.length) {
        toast(`Approved ${json.approved?.length ?? 0}; some failed`, 'error')
      } else {
        toast(`Approved ${json.approved?.length ?? 0} post(s)`, 'success')
      }
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Bulk approve failed', 'error')
    } finally {
      setBulkBusy(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-[#888]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading week…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-[#EDEAE2] bg-white p-8 text-center">
        <p className="text-sm text-[#666]">Could not load this week.</p>
        <button type="button" onClick={onBack} className="mt-3 text-sm font-bold text-[#886600]">
          Back to Planner
        </button>
      </div>
    )
  }

  const { plan, items, timeZone, progress, previewCount, readOnly, scheduledPosts, itemPublishStates } = data
  const dateHeading = formatWeekRangeHeading(plan.week_start_date, timeZone)
  const displayStatus = weekPlanDisplayStatus(plan)
  const showGenerate =
    plan.generation_status === 'not_started' && plan.status === 'plan_approved'
  const readyForProduction = plan.generation_status === 'ready' || plan.generation_status === 'partial_failed'
  const defaultPlatforms = defaultLibrarySelectedPlatforms(connected)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-[#666] hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Planner
          </button>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#886600]">
            Your social week
          </p>
          <h2 className="text-xl font-black text-[#111]">{dateHeading}</h2>
          <p className="mt-1 text-sm text-[#666]">
            {items.length} post{items.length === 1 ? '' : 's'}
            {previewCount > 0 ? ` · ${previewCount} designs` : ''}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#886600]">
            Status: {displayStatus}
          </p>
          {readyForProduction && (
            <p className="mt-2 text-xs text-[#555]">
              {progress.selected} selected · {progress.approved} approved ·{' '}
              {progress.scheduled} scheduled
              {progress.needsReview > 0 ? ` · ${progress.needsReview} need review` : ''}
            </p>
          )}
          {plan.completed_at && (
            <p className="mt-1 text-xs text-[#888]">Week prepared - not all posts may be published yet.</p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {showGenerate && (
            <button
              type="button"
              disabled={generateBusy}
              onClick={() => void openGenerateConfirm()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {generateBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate My Week
            </button>
          )}
          {!readOnly && progress.selected > progress.approved && (
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void approveAllSelected()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EDEAE2] bg-white px-4 py-2.5 text-sm font-bold text-[#444] disabled:opacity-50"
            >
              {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Approve all selected posts
            </button>
          )}
          {!readOnly && readyForProduction && (
            <>
              <button
                type="button"
                disabled={weekActionBusy}
                onClick={() => void resetSelections()}
                className="inline-flex items-center justify-center rounded-xl border border-[#EDEAE2] bg-white px-4 py-2.5 text-sm font-bold text-[#444] disabled:opacity-50"
              >
                Reset selections
              </button>
              <button
                type="button"
                disabled={weekActionBusy}
                onClick={() => void rebuildWeek()}
                className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-50"
              >
                Rebuild week
              </button>
            </>
          )}
          {onBuildAnotherWeek && (
            <button
              type="button"
              onClick={() => onBuildAnotherWeek(plan.week_start_date)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FFD100]/60 bg-[#FFFBEA] px-4 py-2.5 text-sm font-bold text-[#664] hover:bg-[#FFF5CC]"
            >
              <Sparkles className="h-4 w-4" /> Build another week
            </button>
          )}
        </div>
      </div>

      {(plan.generation_status === 'queued' || plan.generation_status === 'generating') && (
        <div className="rounded-xl border border-[#FFD100]/40 bg-[#FFFBEA] p-6 text-center text-sm text-[#555]">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#886600]" />
          Creating 3 designs for each post. This page will update as they finish.
        </div>
      )}

      {!readyForProduction && plan.generation_status !== 'queued' && plan.generation_status !== 'generating' && (
        <div className="rounded-xl border border-dashed border-[#EDEAE2] bg-[#FAFAF8] p-6 text-center text-sm text-[#666]">
          {plan.status === 'draft' ? (
            'Finish building and approve your plan, then generate designs.'
          ) : showGenerate ? (
            <>
              <p>Your plan is approved. Generate 3 designs for each post when ready.</p>
              <button
                type="button"
                disabled={generateBusy}
                onClick={() => void openGenerateConfirm()}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-black hover:bg-yellow-400 disabled:opacity-50"
              >
                {generateBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate My Week
              </button>
            </>
          ) : (
            'Generation in progress or not started.'
          )}
        </div>
      )}

      <div className="space-y-6">
        {items.map((item) => (
          <WeekPlanProductionCard
            key={item.id}
            planId={weekPlanId}
            item={item}
            timeZone={timeZone}
            readOnly={readOnly}
            connected={connected}
            defaultPlatforms={defaultPlatforms.length ? defaultPlatforms : item.platforms}
            publishState={itemPublishStates?.[item.id]}
            scheduledPost={
              item.scheduled_social_post_id
                ? scheduledPosts[item.scheduled_social_post_id] ?? null
                : null
            }
            onUpdated={handleItemUpdated}
            onPostsChanged={onPostsChanged}
          />
        ))}
      </div>

      <GenerateWeekConfirmModal
        open={confirmOpen}
        itemCount={preflight?.itemCount ?? items.length}
        previewCount={preflight?.previewCount ?? items.length * 3}
        creditsRequired={preflight?.creditsRequired ?? items.length}
        busy={generateBusy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmGenerate()}
      />
    </div>
  )
}
