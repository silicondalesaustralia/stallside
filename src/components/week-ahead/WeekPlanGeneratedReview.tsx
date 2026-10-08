'use client'

import type { WeekPlanItemRow } from '@/lib/social/weekPlan/types'
import { WEEK_PLAN_POST_TYPE_LABELS } from '@/lib/social/weekPlan/postTypeMapping'
import { formatWeekPlanDayLabel } from '@/lib/social/weekPlan/weekIdentity'

type Props = {
  items: WeekPlanItemRow[]
  timeZone: string
}

export function WeekPlanGeneratedReview({ items, timeZone }: Props) {
  const generated = items.filter((i) => i.generation_status === 'generated')

  return (
    <div className="space-y-4">
      {generated.map((item) => (
        <article key={item.id} className="rounded-xl border border-[#EDEAE2] bg-[#FAFAF8] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#888]">
            {formatWeekPlanDayLabel(item.target_date, timeZone)}
          </p>
          <p className="text-xs font-semibold text-[#886600] mt-0.5">
            {WEEK_PLAN_POST_TYPE_LABELS[item.post_type]}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#222]">{item.topic}</p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {(item.variant_previews ?? []).map((preview, idx) => (
              <div key={preview.id} className="overflow-hidden rounded-lg border border-[#EDEAE2] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.imageUrl}
                  alt={`Preview ${idx + 1}`}
                  className="aspect-square w-full object-cover"
                />
                <p className="px-1 py-1 text-[10px] font-semibold text-center text-[#666]">
                  Preview {idx + 1}
                </p>
              </div>
            ))}
          </div>

          {item.caption ? (
            <div className="mt-3 rounded-lg bg-white border border-[#EDEAE2] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#888] mb-1">Caption</p>
              <p className="text-sm text-[#333] whitespace-pre-wrap">{item.caption}</p>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
