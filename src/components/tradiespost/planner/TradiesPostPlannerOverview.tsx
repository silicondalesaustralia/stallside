'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { TradiesPostEmptyState } from '@/components/tradiespost/ui/TradiesPostEmptyState'
import { TradiesPostBuddyInsightCard } from '@/components/tradiespost/planner/TradiesPostBuddyInsightCard'
import { TradiesPostContentMixSummary } from '@/components/tradiespost/planner/TradiesPostContentMixSummary'
import {
  TradiesPostMonthProgress,
  TradiesPostMonthProgressSkeleton,
} from '@/components/tradiespost/planner/TradiesPostMonthProgress'
import { TradiesPostPastWeekCard } from '@/components/tradiespost/planner/TradiesPostPastWeekCard'
import { TradiesPostWeekCard } from '@/components/tradiespost/planner/TradiesPostWeekCard'
import { resolveBuddyPlannerInsights } from '@/lib/tradiespost/buddyPlannerInsights'
import {
  buildMonthWeekSlots,
  computeContentMix,
  computeMonthSortedPercent,
  currentMonthLabel,
  entriesInCurrentMonth,
} from '@/lib/tradiespost/plannerMonthView'
import type { WeekPlanListEntry } from '@/lib/social/weekPlan/listWeekPlanHistory'

type TradiesPostPlannerOverviewProps = {
  loading: boolean
  timeZone: string
  upcoming: WeekPlanListEntry[]
  past: WeekPlanListEntry[]
  onBuildMonth: () => void
  onViewWeek: (planId: string) => void
}

export function TradiesPostPlannerOverview({
  loading,
  timeZone,
  upcoming,
  past,
  onBuildMonth,
  onViewWeek,
}: TradiesPostPlannerOverviewProps) {
  const allEntries = [...upcoming, ...past]
  const monthEntries = entriesInCurrentMonth(allEntries, timeZone)
  const monthLabel = currentMonthLabel(timeZone)
  const sortedPercent = computeMonthSortedPercent(monthEntries)
  const weekSlots = buildMonthWeekSlots(allEntries, timeZone)
  const contentMix = computeContentMix(monthEntries)
  const buddy = resolveBuddyPlannerInsights()

  const hasAnyWeeks = upcoming.length > 0 || past.length > 0

  return (
    <div className="space-y-6" data-tp-planner>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Planner</p>
          <h2 className="mt-1 text-xl font-black text-[#18181B] sm:text-2xl">
            Plan your month
          </h2>
          <p className="mt-1 max-w-lg text-sm text-zinc-600">
            Review each week. Approve and schedule. One week at a time - same engine as Build My
            Week.
          </p>
        </div>
        <button
          type="button"
          onClick={onBuildMonth}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5C518] px-5 py-3 text-sm font-black text-[#18181B] shadow-sm hover:bg-[#E5B516] transition-colors sm:sticky sm:top-4"
          data-testid="tp-build-my-week"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Build My Week
        </button>
      </div>

      {loading ? (
        <TradiesPostMonthProgressSkeleton />
      ) : (
        <TradiesPostMonthProgress
          monthLabel={monthLabel}
          sortedPercent={sortedPercent}
          weekSlots={weekSlots}
        />
      )}

      <TradiesPostBuddyInsightCard insights={buddy.insights} supported={buddy.supported} />

      {!loading && contentMix.length > 0 && <TradiesPostContentMixSummary rows={contentMix} />}

      <section className="space-y-3">
        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Upcoming weeks</p>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading your planner…
          </div>
        ) : upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((entry) => (
              <TradiesPostWeekCard
                key={entry.plan.id}
                entry={entry}
                timeZone={timeZone}
                onView={() => onViewWeek(entry.plan.id)}
                onContinue={() => onViewWeek(entry.plan.id)}
              />
            ))}
          </div>
        ) : (
          <TradiesPostEmptyState
            title="Your month is empty"
            description="Build your first week to start filling the month - Buddy creates branded posts and captions for you."
            actionLabel="Build your first week"
            onAction={onBuildMonth}
          />
        )}
      </section>

      {(loading || past.length > 0) && (
        <section className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Past weeks</p>
          {loading ? null : (
            <div className="space-y-2">
              {past.map((entry) => (
                <TradiesPostPastWeekCard
                  key={entry.plan.id}
                  entry={entry}
                  timeZone={timeZone}
                  onView={() => onViewWeek(entry.plan.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && !hasAnyWeeks && (
        <p className="text-center text-xs text-zinc-500">
          Build My Week starts with one week - add more weeks anytime to fill your month.
        </p>
      )}
    </div>
  )
}
