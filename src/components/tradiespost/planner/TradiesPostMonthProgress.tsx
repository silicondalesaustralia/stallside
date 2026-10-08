'use client'

import { TradiesPostCard } from '@/components/tradiespost/ui'
import { TradiesPostProgressBar } from '@/components/tradiespost/ui/TradiesPostProgress'
import {
  monthWeekSlotStatusLabel,
  type MonthWeekSlot,
} from '@/lib/tradiespost/plannerMonthView'

const SLOT_STATUS_CLASS: Record<string, string> = {
  empty: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  planned: 'bg-slate-50 text-slate-700 border-slate-200',
  needs_review: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  scheduled: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  complete: 'bg-zinc-100 text-zinc-600 border-zinc-200',
}

type TradiesPostMonthProgressProps = {
  monthLabel: string
  sortedPercent: number
  weekSlots: MonthWeekSlot[]
}

export function TradiesPostMonthProgress({
  monthLabel,
  sortedPercent,
  weekSlots,
}: TradiesPostMonthProgressProps) {
  return (
    <TradiesPostCard padding="md" elevated={false} className="bg-[#FFFBEB]/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">This month</p>
          <h3 className="mt-1 text-xl font-black text-[#18181B]">{monthLabel}</h3>
          <TradiesPostProgressBar
            className="mt-4"
            value={sortedPercent}
            max={100}
            displayValue={`${sortedPercent}% sorted`}
            hint="Approved, scheduled, or skipped posts in this month"
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[220px]">
          {weekSlots.map((slot) => (
            <div
              key={slot.weekStart}
              className={`rounded-xl border px-3 py-2 ${SLOT_STATUS_CLASS[slot.status] ?? SLOT_STATUS_CLASS.empty}`}
              data-testid={`tp-month-week-${slot.index}`}
            >
              <p className="text-[10px] font-black uppercase tracking-wide opacity-80">
                Week {slot.index}
              </p>
              <p className="mt-0.5 text-xs font-semibold">{monthWeekSlotStatusLabel(slot.status)}</p>
            </div>
          ))}
        </div>
      </div>
    </TradiesPostCard>
  )
}

export function TradiesPostMonthProgressSkeleton() {
  return (
    <TradiesPostCard padding="md" elevated={false} className="animate-pulse bg-zinc-50">
      <div className="h-24 rounded-xl bg-zinc-100" />
    </TradiesPostCard>
  )
}
