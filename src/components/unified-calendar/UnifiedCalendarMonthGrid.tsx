'use client'

import { UNIFIED_CATEGORY_TONE } from '@/lib/unified-calendar/categories'
import { isDateInMonth } from '@/lib/tradiespost/calendarMonthView'
import type { UnifiedItem, UnifiedSlot } from '@/lib/unified-calendar/types'
import UnifiedCalendarItemCard from './UnifiedCalendarItemCard'
import { dropTargetProps } from './dnd'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_CARDS = 3

type Props = {
  monthAnchor: string
  days: string[]
  itemsByDay: Map<string, UnifiedItem[]>
  todayKey: string
  timeZone: string
  selectedId: string | null
  onSelect: (item: UnifiedItem) => void
  onDropItem: (itemId: string, slot: UnifiedSlot) => void
  onCreate: (slot: UnifiedSlot) => void
  onShowDay: (dayKey: string) => void
}

export default function UnifiedCalendarMonthGrid(props: Props) {
  const { monthAnchor, days, itemsByDay, todayKey, timeZone, selectedId } = props
  const rows = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7))

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-1 py-2 text-center text-[10px] font-black uppercase tracking-wide text-zinc-500">
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.charAt(0)}</span>
          </div>
        ))}
      </div>

      {rows.map((week) => (
        <div key={week[0]} className="grid grid-cols-7 border-b border-zinc-100 last:border-b-0">
          {week.map((dayKey) => {
            const inMonth = isDateInMonth(dayKey, monthAnchor)
            const isToday = dayKey === todayKey
            const dayItems = itemsByDay.get(dayKey) ?? []
            const slot = { dayKey, hour: null }
            return (
              <div
                key={dayKey}
                {...dropTargetProps(slot, props.onDropItem)}
                onClick={() => props.onCreate(slot)}
                className={`min-h-[72px] cursor-pointer border-r border-zinc-100 p-1 last:border-r-0 hover:bg-zinc-50/60 sm:min-h-[110px] sm:p-1.5 ${
                  inMonth ? 'bg-white' : 'bg-zinc-50/80 text-zinc-400'
                } ${isToday ? 'bg-[#FFFBEB]/60 ring-1 ring-inset ring-[#F5C518]/40' : ''}`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isToday ? 'bg-[#F5C518] text-[#18181B]' : inMonth ? 'text-[#18181B]' : 'text-zinc-400'
                  }`}
                >
                  {Number(dayKey.split('-')[2])}
                </span>

                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {dayItems.slice(0, 4).map((item) => (
                    <span key={item.id} className={`h-2 w-2 rounded-full ${UNIFIED_CATEGORY_TONE[item.category].dot}`} />
                  ))}
                </div>

                <div className="mt-1 hidden space-y-1 sm:block">
                  {dayItems.slice(0, MAX_CARDS).map((item) => (
                    <UnifiedCalendarItemCard
                      key={item.id}
                      item={item}
                      timeZone={timeZone}
                      selected={selectedId === item.id}
                      variant="mini"
                      onSelect={props.onSelect}
                    />
                  ))}
                  {dayItems.length > MAX_CARDS && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        props.onShowDay(dayKey)
                      }}
                      className="px-0.5 text-[9px] font-semibold text-zinc-500 hover:text-[#18181B] hover:underline"
                    >
                      +{dayItems.length - MAX_CARDS} more
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
