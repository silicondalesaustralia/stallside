'use client'

import { ChevronRight } from 'lucide-react'
import { TradiesPostCard } from '@/components/tradiespost/ui'
import { TradiesPostContentThumbnail } from '@/components/tradiespost/ui/TradiesPostContentThumbnail'
import { TradiesPostStatusBadge } from '@/components/tradiespost/ui/TradiesPostStatusBadge'
import type { WeekPlanListEntry } from '@/lib/social/weekPlan/listWeekPlanHistory'
import {
  formatPlannerDayShort,
  formatWeekRangeMonthLabel,
  getWeekPlanItemImageUrl,
  mapWeekPlanItemToTpStatus,
  weekCardStatusLabel,
} from '@/lib/tradiespost/plannerMonthView'

type TradiesPostWeekCardProps = {
  entry: WeekPlanListEntry
  timeZone: string
  onView: () => void
  onContinue?: () => void
}

function previewGridClass(count: number): string {
  if (count <= 1) return 'grid-cols-1 max-w-[220px]'
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
  if (count === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
  return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
}

export function TradiesPostWeekCard({
  entry,
  timeZone,
  onView,
  onContinue,
}: TradiesPostWeekCardProps) {
  const { plan, itemCount, items } = entry
  const isDraft = plan.status === 'draft'
  const statusLabel = weekCardStatusLabel(entry)
  const previewItems = items.slice(0, 4)
  const action = isDraft && onContinue ? onContinue : onView
  const actionLabel = isDraft ? 'Continue' : 'View week'

  return (
    <TradiesPostCard padding="md" className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black text-[#18181B]">
            {formatWeekRangeMonthLabel(plan.week_start_date, timeZone)}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {itemCount} post{itemCount === 1 ? '' : 's'}
          </p>
          <TradiesPostStatusBadge
            status={
              statusLabel === 'Ready to review'
                ? 'needs_review'
                : statusLabel === 'Draft' || statusLabel === 'Generating'
                  ? 'draft'
                  : statusLabel === 'Archived'
                    ? 'published'
                    : 'ready'
            }
            label={statusLabel}
            dot
            className="mt-2 w-fit"
          />
        </div>
        <button
          type="button"
          onClick={action}
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#F5C518] px-4 py-2.5 text-sm font-black text-[#18181B] transition-colors hover:bg-[#E5B516] sm:w-auto sm:self-start"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {previewItems.length > 0 && (
        <div
          className={`mt-4 grid items-stretch gap-3 ${previewGridClass(previewItems.length)}`}
          data-testid="tp-week-thumbnails"
        >
          {previewItems.map((item) => (
            <TradiesPostContentThumbnail
              key={item.id}
              size="md"
              src={getWeekPlanItemImageUrl(item)}
              alt={item.topic}
              title={formatPlannerDayShort(item.target_date, timeZone)}
              status={mapWeekPlanItemToTpStatus(item)}
              aspect="square"
              onClick={onView}
              className="flex h-full min-w-0 flex-col [&>div]:flex [&>div]:h-full [&>div]:flex-col [&_.tp-card-title]:text-xs [&_.rounded-2xl>div:last-child]:space-y-1 [&_.rounded-2xl>div:last-child]:p-2"
            />
          ))}
        </div>
      )}
    </TradiesPostCard>
  )
}
