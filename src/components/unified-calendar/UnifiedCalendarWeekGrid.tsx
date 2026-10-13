'use client'

import { useMemo } from 'react'
import { formatCompactDayHeader } from '@/lib/social/socialCalendarGrid'
import { formatHourLabel, itemStartHour, weekHours } from '@/lib/unified-calendar/grid'
import type { UnifiedItem, UnifiedSlot } from '@/lib/unified-calendar/types'
import UnifiedCalendarItemCard from './UnifiedCalendarItemCard'
import { dropTargetProps } from './dnd'

type Props = {
  days: string[]
  itemsByDay: Map<string, UnifiedItem[]>
  todayKey: string
  timeZone: string
  selectedId: string | null
  onSelect: (item: UnifiedItem) => void
  onDropItem: (itemId: string, slot: UnifiedSlot) => void
  onCreate: (slot: UnifiedSlot) => void
}

const ROW = 'grid grid-cols-[52px_repeat(7,minmax(0,1fr))]'

export default function UnifiedCalendarWeekGrid(props: Props) {
  const { days, itemsByDay, todayKey, timeZone, selectedId } = props

  const { hours, allDay, byHour } = useMemo(() => {
    const all = days.flatMap((d) => itemsByDay.get(d) ?? [])
    const allDayMap = new Map<string, UnifiedItem[]>()
    const hourMap = new Map<string, UnifiedItem[]>()
    for (const day of days) {
      for (const item of itemsByDay.get(day) ?? []) {
        const key = item.allDay ? day : `${day}|${itemStartHour(item, timeZone)}`
        const map = item.allDay ? allDayMap : hourMap
        map.set(key, [...(map.get(key) ?? []), item])
      }
    }
    return { hours: weekHours(all, timeZone), allDay: allDayMap, byHour: hourMap }
  }, [days, itemsByDay, timeZone])

  function cell(slot: UnifiedSlot, items: UnifiedItem[], minHeight: string) {
    return (
      <div
        key={`${slot.dayKey}-${slot.hour ?? 'all'}`}
        {...dropTargetProps(slot, props.onDropItem)}
        onClick={() => props.onCreate(slot)}
        style={{ minHeight }}
        className={`min-w-0 cursor-pointer space-y-1 border-r border-[#F0EDE5] p-0.5 last:border-r-0 hover:bg-zinc-50/60 ${
          slot.dayKey === todayKey ? 'bg-[#FFFBEA]/20' : ''
        }`}
      >
        {items.map((item) => (
          <UnifiedCalendarItemCard
            key={item.id}
            item={item}
            timeZone={timeZone}
            selected={selectedId === item.id}
            variant="compact"
            onSelect={props.onSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="hidden overflow-x-auto md:block">
      <div className="min-w-[760px] overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className={`${ROW} border-b border-[#EDEAE2] bg-[#FAFAF8]`}>
          <div className="border-r border-[#EDEAE2]" />
          {days.map((dayKey) => {
            const header = formatCompactDayHeader(dayKey, timeZone, dayKey === todayKey)
            return (
              <div
                key={dayKey}
                className={`border-r border-[#EDEAE2] px-1 py-2 text-center last:border-r-0 ${
                  header.isToday ? 'border-b-2 border-b-[#F5C518] bg-[#FFFBEA]/50' : ''
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{header.weekday}</p>
                <p className="text-xs font-semibold text-[#222]">{header.date}</p>
              </div>
            )
          })}
        </div>

        <div className={`${ROW} border-b border-[#EDEAE2] bg-zinc-50/40`}>
          <div className="border-r border-[#F0EDE5] pr-1 pt-1 text-right text-[10px] text-[#AAA]">All day</div>
          {days.map((dayKey) => cell({ dayKey, hour: null }, allDay.get(dayKey) ?? [], '36px'))}
        </div>

        {hours.map((hour) => (
          <div key={hour} className={`${ROW} border-b border-[#F0EDE5] last:border-b-0`}>
            <div className="border-r border-[#F0EDE5] pr-1 pt-1 text-right text-[10px] text-[#AAA]">
              {formatHourLabel(hour)}
            </div>
            {days.map((dayKey) => cell({ dayKey, hour }, byHour.get(`${dayKey}|${hour}`) ?? [], '52px'))}
          </div>
        ))}
      </div>
    </div>
  )
}
