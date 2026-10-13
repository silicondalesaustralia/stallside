'use client'

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { UnifiedView } from '@/lib/unified-calendar/types'

type Props = {
  heading: string
  view: UnifiedView
  pending: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: UnifiedView) => void
}

export default function UnifiedCalendarToolbar({
  heading,
  view,
  pending,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: Props) {
  const unit = view === 'month' ? 'month' : 'week'
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <h2 className="flex items-center gap-2 text-lg font-black text-[#18181B] sm:text-xl">
        {heading}
        {pending && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" aria-label="Loading" />}
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-zinc-200 bg-white p-0.5">
          {(['month', 'week'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange(mode)}
              aria-pressed={view === mode}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                view === mode ? 'bg-[#F5C518] text-[#18181B]' : 'text-zinc-600 hover:text-[#18181B]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-1">
          <button
            type="button"
            aria-label={`Previous ${unit}`}
            onClick={onPrev}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg px-2 py-1.5 text-xs font-bold text-[#18181B] hover:bg-[#FFFBEB]"
          >
            Today
          </button>
          <button
            type="button"
            aria-label={`Next ${unit}`}
            onClick={onNext}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
