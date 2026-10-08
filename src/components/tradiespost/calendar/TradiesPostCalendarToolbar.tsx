'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export type TradiesPostCalendarViewMode = 'month' | 'week'

type TradiesPostCalendarToolbarProps = {
  heading: string
  viewMode: TradiesPostCalendarViewMode
  filter: 'all' | 'automatic' | 'manual'
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewModeChange: (mode: TradiesPostCalendarViewMode) => void
  onFilterChange: (filter: 'all' | 'automatic' | 'manual') => void
  prevLabel?: string
  nextLabel?: string
}

export function TradiesPostCalendarToolbar({
  heading,
  viewMode,
  filter,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  onFilterChange,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}: TradiesPostCalendarToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Calendar</p>
        <h2 className="text-lg font-black text-[#18181B] sm:text-xl">{heading}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-zinc-200 bg-white p-0.5">
          {(['month', 'week'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-[#F5C518] text-[#18181B]'
                  : 'text-zinc-600 hover:text-[#18181B]'
              }`}
              data-testid={`tp-calendar-view-${mode}`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-1">
          <button
            type="button"
            aria-label={prevLabel}
            onClick={onPrev}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-[120px] text-center text-sm font-semibold text-[#18181B] sm:min-w-[160px]">
            {heading}
          </p>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={onNext}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToday}
          className="rounded-xl border border-[#F5C518]/40 bg-[#FFFBEB] px-3 py-1.5 text-xs font-bold text-[#18181B] hover:bg-[#F5C518]/20"
        >
          Today
        </button>

        <div className="flex gap-0.5 rounded-xl border border-zinc-200 bg-white p-0.5">
          {(['all', 'automatic', 'manual'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize ${
                filter === f ? 'bg-[#18181B] text-white' : 'text-zinc-600 hover:text-[#18181B]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'automatic' ? 'Automatic' : 'Manual'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
