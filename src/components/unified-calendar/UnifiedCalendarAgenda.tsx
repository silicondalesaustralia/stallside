'use client'

import { formatCompactDayHeader } from '@/lib/social/socialCalendarGrid'
import { formatItemTime } from '@/lib/unified-calendar/grid'
import type { UnifiedItem } from '@/lib/unified-calendar/types'
import UnifiedCalendarItemCard from './UnifiedCalendarItemCard'

type Props = {
  days: string[]
  itemsByDay: Map<string, UnifiedItem[]>
  todayKey: string
  timeZone: string
  selectedId: string | null
  /** Week view lists every day; month view only days with something on. */
  showEmptyDays: boolean
  onSelect: (item: UnifiedItem) => void
}

/** Phone layout: drag doesn't work on touch, so moves happen from the detail drawer. */
export default function UnifiedCalendarAgenda({
  days,
  itemsByDay,
  todayKey,
  timeZone,
  selectedId,
  showEmptyDays,
  onSelect,
}: Props) {
  const listed = showEmptyDays ? days : days.filter((d) => (itemsByDay.get(d)?.length ?? 0) > 0)
  if (listed.length === 0) return null

  return (
    <div className="space-y-4 md:hidden">
      {listed.map((dayKey) => {
        const header = formatCompactDayHeader(dayKey, timeZone, dayKey === todayKey)
        const dayItems = itemsByDay.get(dayKey) ?? []
        return (
          <section key={dayKey}>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">
              {header.weekday} {header.date}
              {header.isToday ? ' · Today' : ''}
            </h3>
            {dayItems.length === 0 ? (
              <p className="text-xs text-zinc-300">Nothing scheduled</p>
            ) : (
              <div className="space-y-2">
                {dayItems.map((item) => (
                  <div key={item.id}>
                    {item.kind === 'post' && (
                      <p className="mb-1 text-[10px] font-semibold text-zinc-500">
                        {formatItemTime(item, timeZone)}
                      </p>
                    )}
                    <UnifiedCalendarItemCard
                      item={item}
                      timeZone={timeZone}
                      selected={selectedId === item.id}
                      variant="compact"
                      onSelect={onSelect}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
