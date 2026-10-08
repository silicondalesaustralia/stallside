'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { BuildMyWeekPanel } from '@/components/week-ahead/BuildMyWeekPanel'
import { PlannerWeekDetail } from '@/components/social/PlannerWeekDetail'
import {
  formatWeekRangeCompact,
  formatWeekRangeHeading,
} from '@/lib/social/weekPlan/weekIdentity'
import {
  weekPlanDisplayStatus,
  weekPlanStatusDetail,
} from '@/lib/social/weekPlan/weekPlanDisplayStatus'
import {
  occupiedActiveWeekStarts,
  suggestWeekAfter,
} from '@/lib/social/weekPlan/weekPlanWeekSelection'
import type { WeekPlanListEntry } from '@/lib/social/weekPlan/listWeekPlanHistory'
import { TradiesPostPlannerOverview } from '@/components/tradiespost/planner/TradiesPostPlannerOverview'
import type { SocialProductVariant } from '@/components/tradiespost/SocialProductVariant'

type HistoryResponse = {
  timeZone: string
  upcoming: WeekPlanListEntry[]
  past: WeekPlanListEntry[]
}

type BusinessConnections = {
  facebook_page_id?: string | null
  instagram_account_id?: string | null
  gmb_account_id?: string | null
}

type Props = {
  autoOpenWizard?: boolean
  weekPlanId?: string | null
  business: BusinessConnections | null
  onOpenWeekPlan: (planId: string) => void
  onCloseWeekPlan: () => void
  onPostsChanged?: () => void
  variant?: SocialProductVariant
}

function WeekPlanRow({
  entry,
  timeZone,
  section,
  onView,
  onContinue,
}: {
  entry: WeekPlanListEntry
  timeZone: string
  section: 'upcoming' | 'past'
  onView: () => void
  onContinue?: () => void
}) {
  const { plan, itemCount, previewCount } = entry
  const status = weekPlanDisplayStatus(plan)
  const detail = weekPlanStatusDetail(plan, entry.items)
  const dates =
    section === 'upcoming'
      ? formatWeekRangeHeading(plan.week_start_date, timeZone)
      : formatWeekRangeCompact(plan.week_start_date, timeZone)
  const isDraft = plan.status === 'draft'
  const actionLabel = isDraft ? 'Continue' : 'View week'
  const action = isDraft && onContinue ? onContinue : onView

  return (
    <div className="w-full rounded-xl border border-[#EDEAE2] bg-white p-4 transition-colors hover:border-[#FFD100]/50 hover:bg-[#FFFBEA]/40">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <button type="button" onClick={onView} className="flex-1 text-left">
          <p className="text-sm font-black text-[#111]">{dates}</p>
          <p className="mt-0.5 text-sm text-[#666]">
            {itemCount} post{itemCount === 1 ? '' : 's'}
            {previewCount > 0 ? ` · ${previewCount} previews` : ''}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#886600]">
            {status}
            {detail ? ` - ${detail}` : ''}
          </p>
        </button>
        <button
          type="button"
          onClick={action}
          className="shrink-0 rounded-lg border border-[#EDEAE2] bg-white px-3 py-2 text-xs font-bold text-[#444] hover:border-[#FFD100]/60 hover:bg-[#FFFBEA]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}

export function PlannerTab({
  autoOpenWizard = false,
  weekPlanId = null,
  business,
  onOpenWeekPlan,
  onCloseWeekPlan,
  onPostsChanged,
  variant = 'stitchedup',
}: Props) {
  const isTradiesPost = variant === 'tradiespost'
  const { toast } = useToast()
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [wizardSignal, setWizardSignal] = useState(0)
  const [suggestedWeekStart, setSuggestedWeekStart] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/social/week-plan/history')
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      setHistory(await res.json())
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not load planner history', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  function openWizard(weekStart?: string | null) {
    setSuggestedWeekStart(weekStart ?? null)
    setWizardSignal((n) => n + 1)
  }

  const timeZone = history?.timeZone ?? 'Australia/Sydney'

  function handleBuildAnotherWeek(afterWeekStart: string) {
    const occupied = occupiedActiveWeekStarts(
      (history?.upcoming ?? []).map((e) => ({
        weekStartDate: e.plan.week_start_date,
        planId: e.plan.id,
        status: e.plan.status,
        generationStatus: e.plan.generation_status,
      })),
    )
    const next = suggestWeekAfter(afterWeekStart, occupied, timeZone)
    openWizard(next)
  }

  return (
    <>
      {weekPlanId && business ? (
        <PlannerWeekDetail
          weekPlanId={weekPlanId}
          business={business}
          onBack={onCloseWeekPlan}
          onPlanUpdated={() => void loadHistory()}
          onPostsChanged={onPostsChanged}
          onBuildAnotherWeek={handleBuildAnotherWeek}
        />
      ) : isTradiesPost ? (
        <TradiesPostPlannerOverview
          loading={loading}
          timeZone={timeZone}
          upcoming={history?.upcoming ?? []}
          past={history?.past ?? []}
          onBuildMonth={() => openWizard()}
          onViewWeek={onOpenWeekPlan}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-[#111]">Social Planner</h2>
              <p className="mt-1 text-sm text-[#666]">
                Plan, create and review your weekly content.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openWizard()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-black hover:bg-yellow-400 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Build My Week
            </button>
          </div>

          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#888]">Upcoming</p>
            {loading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-[#888]">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : history && history.upcoming.length > 0 ? (
              <div className="space-y-2">
                {history.upcoming.map((entry) => (
                  <WeekPlanRow
                    key={entry.plan.id}
                    entry={entry}
                    timeZone={timeZone}
                    section="upcoming"
                    onView={() => onOpenWeekPlan(entry.plan.id)}
                    onContinue={() => onOpenWeekPlan(entry.plan.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#EDEAE2] bg-[#FAFAF8] p-6 text-center">
                <p className="text-sm text-[#666]">No upcoming weekly plans yet.</p>
                <button
                  type="button"
                  onClick={() => openWizard()}
                  className="mt-3 text-sm font-bold text-[#886600] hover:underline"
                >
                  Build My Week
                </button>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#888]">Past weeks</p>
            {loading ? null : history && history.past.length > 0 ? (
              <div className="space-y-2">
                {history.past.map((entry) => (
                  <WeekPlanRow
                    key={entry.plan.id}
                    entry={entry}
                    timeZone={timeZone}
                    section="past"
                    onView={() => onOpenWeekPlan(entry.plan.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#888]">Completed and archived weeks will appear here.</p>
            )}
          </section>
        </div>
      )}

      <BuildMyWeekPanel
        showCard={false}
        autoOpenWizard={autoOpenWizard}
        openWizardSignal={wizardSignal}
        suggestedWeekStart={suggestedWeekStart}
        onOpenProductionDesk={onOpenWeekPlan}
        onPlanChange={() => void loadHistory()}
      />
    </>
  )
}
