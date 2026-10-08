'use client'

import type { WeekPlanGenerationProgress } from '@/lib/social/weekPlan/weekPlanGenerationProgress'
import { WEEK_PLAN_POST_TYPE_LABELS } from '@/lib/social/weekPlan/postTypeMapping'
import { formatWeekPlanDayLabel } from '@/lib/social/weekPlan/weekIdentity'
import type { WeekPlanItemRow } from '@/lib/social/weekPlan/types'

type Props = {
  progress: WeekPlanGenerationProgress
  items: WeekPlanItemRow[]
  timeZone: string
}

function statusLabel(status: WeekPlanItemRow['generation_status']): string {
  switch (status) {
    case 'generated':
      return 'Ready'
    case 'generating':
      return 'Creating…'
    case 'queued':
      return 'Waiting…'
    case 'failed':
      return 'Failed'
    default:
      return 'Pending'
  }
}

export function WeekPlanGenerationProgressPanel({ progress, items, timeZone }: Props) {
  const active = progress.planGenerationStatus === 'queued' || progress.planGenerationStatus === 'generating'

  return (
    <div className="rounded-xl border border-[#EDEAE2] bg-[#FAFAF8] p-4 space-y-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#886600]">
          {active ? 'Creating your week' : progress.planGenerationStatus === 'ready' ? 'Your week is ready' : 'Generation status'}
        </p>
        <p className="mt-1 text-sm font-semibold text-[#222]">
          {progress.generated} of {progress.total} post{progress.total === 1 ? '' : 's'} ready
        </p>
        {active && (
          <p className="mt-1 text-xs text-[#666]">
            You can leave this page - we&apos;ll keep creating your posts.
          </p>
        )}
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-[#EDEAE2] bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#888]">
                Post {index + 1} · {formatWeekPlanDayLabel(item.target_date, timeZone)}
              </p>
              <p className="text-xs font-semibold text-[#886600]">
                {WEEK_PLAN_POST_TYPE_LABELS[item.post_type]}
              </p>
              <p className="truncate text-sm text-[#333]">{item.topic}</p>
            </div>
            <span
              className={`shrink-0 text-[11px] font-bold ${
                item.generation_status === 'generated'
                  ? 'text-green-700'
                  : item.generation_status === 'failed'
                    ? 'text-red-600'
                    : item.generation_status === 'generating'
                      ? 'text-[#886600]'
                      : 'text-[#888]'
              }`}
            >
              {item.generation_status === 'generated' ? '✓' : null}{' '}
              {statusLabel(item.generation_status)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
