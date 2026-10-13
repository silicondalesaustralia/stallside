'use client'

import { UNIFIED_CATEGORY_LABEL, UNIFIED_CATEGORY_TONE } from '@/lib/unified-calendar/categories'
import { formatItemTime } from '@/lib/unified-calendar/grid'
import type { UnifiedEventItem } from '@/lib/unified-calendar/types'

type Props = {
  item: UnifiedEventItem
  timeZone: string
  selected: boolean
  variant: 'mini' | 'compact' | 'full'
  onSelect: () => void
}

export default function UnifiedEventCard({ item, timeZone, selected, variant, onSelect }: Props) {
  const tone = UNIFIED_CATEGORY_TONE[item.category]
  const time = formatItemTime(item, timeZone)
  const label = item.allDay ? item.title : `${time} ${item.title}`
  const border = selected
    ? 'border-[#F5C518] bg-[#FFFBEB] ring-1 ring-[#F5C518]/30'
    : `${tone.card} hover:shadow-sm`

  if (variant === 'mini') {
    return (
      <button
        type="button"
        onClick={onSelect}
        title={label}
        className={`flex w-full min-w-0 items-center gap-1 rounded-md border px-1 py-0.5 text-left ${border}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
        <span className="min-w-0 truncate text-[9px] font-semibold text-[#18181B]">{label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${UNIFIED_CATEGORY_LABEL[item.category]}: ${label}`}
      className={`flex w-full min-w-0 flex-col rounded-xl border text-left transition-all ${
        variant === 'compact' ? 'p-2' : 'p-2.5'
      } ${border}`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
        <span className="text-[11px] font-bold tabular-nums text-[#18181B]">{time}</span>
        <span className="min-w-0 truncate text-[9px] font-bold uppercase tracking-wide text-zinc-500">
          {UNIFIED_CATEGORY_LABEL[item.category]}
        </span>
      </span>
      <span className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-zinc-800">
        {item.title}
      </span>
      {item.event.summary && (
        <span className="mt-0.5 line-clamp-1 text-[10px] text-zinc-500">{item.event.summary}</span>
      )}
    </button>
  )
}
