'use client'

import { ChevronRight } from 'lucide-react'
import { TradiesPostCard } from '@/components/tradiespost/ui'
import type { WeekPlanListEntry } from '@/lib/social/weekPlan/listWeekPlanHistory'
import {
  countScheduledItems,
  formatWeekRangeCompact,
  getWeekPlanItemImageUrl,
} from '@/lib/tradiespost/plannerMonthView'

type TradiesPostPastWeekCardProps = {
  entry: WeekPlanListEntry
  timeZone: string
  onView: () => void
}

export function TradiesPostPastWeekCard({ entry, timeZone, onView }: TradiesPostPastWeekCardProps) {
  const { plan, itemCount, items } = entry
  const scheduledCount = countScheduledItems(entry)
  const thumbs = items
    .map((item) => getWeekPlanItemImageUrl(item))
    .filter((url): url is string => Boolean(url))
    .slice(0, 5)

  return (
    <TradiesPostCard padding="sm" elevated={false} className="hover:border-zinc-300 transition-colors">
      <button
        type="button"
        onClick={onView}
        className="flex w-full items-center gap-3 text-left"
        data-testid="tp-past-week-card"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-black text-[#18181B]">
              {formatWeekRangeCompact(plan.week_start_date, timeZone)}
            </p>
            <p className="text-xs text-zinc-500">
              {itemCount} post{itemCount === 1 ? '' : 's'}
              {scheduledCount > 0
                ? ` · ${scheduledCount} scheduled`
                : ''}
            </p>
          </div>
          {thumbs.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {thumbs.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${plan.id}-thumb-${i}`}
                  src={src}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg border border-zinc-200 object-cover"
                />
              ))}
            </div>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#18181B]">
          View
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </button>
    </TradiesPostCard>
  )
}
