'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { dateKeyInTimeZone } from '@/lib/utils/australiaSydneyTime'
import { isDateInMonth } from '@/lib/tradiespost/calendarMonthView'
import { groupItemsByDay } from '@/lib/unified-calendar/grid'
import { calendarHeading, monthAnchorOf, visibleDayKeys } from '@/lib/unified-calendar/range'
import type { UnifiedCalendarData } from '@/lib/unified-calendar/loadUnifiedCalendar'
import type { UnifiedCategory, UnifiedSlot } from '@/lib/unified-calendar/types'
import CreateSlotSheet from './CreateSlotSheet'
import UnifiedCalendarAgenda from './UnifiedCalendarAgenda'
import UnifiedCalendarFilters from './UnifiedCalendarFilters'
import UnifiedCalendarMonthGrid from './UnifiedCalendarMonthGrid'
import UnifiedCalendarToolbar from './UnifiedCalendarToolbar'
import UnifiedCalendarWeekGrid from './UnifiedCalendarWeekGrid'
import UnifiedEventDrawer from './UnifiedEventDrawer'
import UnifiedPostDrawer from './UnifiedPostDrawer'
import { useCalendarMoves } from './useCalendarMoves'
import { useCalendarNavigation } from './useCalendarNavigation'
import { useCategoryFilter } from './useCategoryFilter'

type Props = UnifiedCalendarData & {
  /** Social → Calendar opens on posts only; the main calendar shows everything. */
  initialCategories?: UnifiedCategory[]
}

export default function UnifiedCalendar({
  items,
  view,
  dateKey,
  timeZone,
  initialSelectedId,
  initialCategories,
}: Props) {
  const { liveItems, moveItem, dropOnSlot } = useCalendarMoves(items, timeZone)
  const filter = useCategoryFilter(liveItems, initialCategories ?? null)
  const nav = useCalendarNavigation(view, dateKey, timeZone)
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)
  const [createSlot, setCreateSlot] = useState<UnifiedSlot | null>(null)

  const days = useMemo(() => visibleDayKeys(view, dateKey, timeZone), [view, dateKey, timeZone])
  const itemsByDay = useMemo(
    () => groupItemsByDay(filter.visible, days, timeZone),
    [filter.visible, days, timeZone],
  )
  const monthAnchor = monthAnchorOf(dateKey)
  const todayKey = dateKeyInTimeZone(new Date(), timeZone)
  const selected = liveItems.find((i) => i.id === selectedId) ?? null
  const closeDrawer = () => setSelectedId(null)
  const shared = {
    itemsByDay,
    todayKey,
    timeZone,
    selectedId,
    onSelect: (item: { id: string }) => setSelectedId(item.id),
  }

  return (
    <div className="space-y-3">
      <UnifiedCalendarToolbar
        heading={calendarHeading(view, dateKey, timeZone)}
        view={view}
        pending={nav.pending}
        onPrev={nav.prev}
        onNext={nav.next}
        onToday={nav.today}
        onViewChange={nav.setView}
      />
      <UnifiedCalendarFilters
        available={filter.available}
        counts={filter.counts}
        allActive={filter.allActive}
        isActive={filter.isActive}
        onToggle={filter.toggle}
        onShowAll={filter.showAll}
      />

      <div className={`space-y-4 transition-opacity ${nav.pending ? 'opacity-60' : ''}`}>
        {view === 'month' ? (
          <UnifiedCalendarMonthGrid
            {...shared}
            monthAnchor={monthAnchor}
            days={days}
            onDropItem={dropOnSlot}
            onCreate={setCreateSlot}
            onShowDay={nav.showDay}
          />
        ) : (
          <UnifiedCalendarWeekGrid {...shared} days={days} onDropItem={dropOnSlot} onCreate={setCreateSlot} />
        )}
        <UnifiedCalendarAgenda
          {...shared}
          days={view === 'month' ? days.filter((d) => isDateInMonth(d, monthAnchor)) : days}
          showEmptyDays={view === 'week'}
        />
      </div>

      {filter.visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-600">
          Nothing scheduled here yet. Click a day to add something, or{' '}
          <Link href="/dashboard/social/create" className="font-semibold text-[#18181B] underline">
            create a post
          </Link>
          .
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Drag posts, pickup and delivery windows, order cut-offs, markets and custom-order due dates to
        reschedule. Packing, production and My calendar items are read-only.
      </p>

      {selected?.kind === 'post' && (
        <UnifiedPostDrawer key={selected.id} item={selected} timeZone={timeZone} onClose={closeDrawer} onMove={moveItem} />
      )}
      {selected?.kind === 'event' && (
        <UnifiedEventDrawer key={selected.id} item={selected} timeZone={timeZone} onClose={closeDrawer} onMove={moveItem} />
      )}
      {createSlot && <CreateSlotSheet slot={createSlot} timeZone={timeZone} onClose={() => setCreateSlot(null)} />}
    </div>
  )
}
