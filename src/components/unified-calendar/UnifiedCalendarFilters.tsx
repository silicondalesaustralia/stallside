'use client'

import { UNIFIED_CATEGORY_LABEL, UNIFIED_CATEGORY_TONE } from '@/lib/unified-calendar/categories'
import type { UnifiedCategory } from '@/lib/unified-calendar/types'

type Props = {
  available: UnifiedCategory[]
  counts: Map<UnifiedCategory, number>
  allActive: boolean
  isActive: (category: UnifiedCategory) => boolean
  onToggle: (category: UnifiedCategory) => void
  onShowAll: () => void
}

export default function UnifiedCalendarFilters({
  available,
  counts,
  allActive,
  isActive,
  onToggle,
  onShowAll,
}: Props) {
  const chip = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors'
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show on calendar">
      <button
        type="button"
        onClick={onShowAll}
        aria-pressed={allActive}
        className={`${chip} ${
          allActive ? 'border-[#18181B] bg-[#18181B] text-white' : 'border-zinc-200 bg-white text-zinc-600'
        }`}
      >
        Everything
      </button>
      {available.map((category) => {
        const on = !allActive && isActive(category)
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            aria-pressed={on}
            className={`${chip} ${
              on
                ? 'border-[#F5C518] bg-[#FFFBEB] text-[#18181B]'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${UNIFIED_CATEGORY_TONE[category].dot}`} aria-hidden />
            {UNIFIED_CATEGORY_LABEL[category]}
            <span className="tabular-nums text-zinc-400">{counts.get(category) ?? 0}</span>
          </button>
        )
      })}
    </div>
  )
}
