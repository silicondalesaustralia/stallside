'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, MapPin, X } from 'lucide-react'
import { UNIFIED_CATEGORY_LABEL, UNIFIED_CATEGORY_TONE } from '@/lib/unified-calendar/categories'
import { formatItemTime, itemDayKey, itemLocalTime, timesAt } from '@/lib/unified-calendar/grid'
import { formatCalendarDetailHeading } from '@/lib/social/socialCalendarGrid'
import type { UnifiedEventItem, UnifiedMoveTimes } from '@/lib/unified-calendar/types'

type Props = {
  item: UnifiedEventItem
  timeZone: string
  onClose: () => void
  onMove: (item: UnifiedEventItem, times: UnifiedMoveTimes) => Promise<void>
}

const BUTTON = 'flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2 text-xs font-semibold text-[#18181B] hover:bg-zinc-50'

export default function UnifiedEventDrawer({ item, timeZone, onClose, onMove }: Props) {
  const [moveOpen, setMoveOpen] = useState(false)
  const [date, setDate] = useState(() => itemDayKey(item, timeZone))
  const [time, setTime] = useState(() => itemLocalTime(item, timeZone))
  const { event } = item
  const external = /^https?:\/\//.test(event.href)

  function saveMove() {
    if (!date) return
    onClose()
    void onMove(item, timesAt(item, date, item.allDay ? '00:00' : time || '09:00', timeZone))
  }

  return (
    <>
      <button type="button" aria-label="Close details" className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="unified-event-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-4 py-3">
          <div className="min-w-0 pr-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
              <span className={`h-2 w-2 rounded-full ${UNIFIED_CATEGORY_TONE[item.category].dot}`} aria-hidden />
              {UNIFIED_CATEGORY_LABEL[item.category]}
            </p>
            <p id="unified-event-title" className="mt-1 text-sm font-black text-[#18181B]">{item.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {formatCalendarDetailHeading(item.startsAt, timeZone)} · {formatItemTime(item, timeZone)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-50" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {event.summary && <p className="text-sm leading-relaxed text-zinc-600">{event.summary}</p>}
          {event.location && (
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {event.location}
            </p>
          )}
          {event.status && <p className="text-xs text-zinc-500">Status: {event.status}</p>}

          {external ? (
            <a href={event.href} target="_blank" rel="noopener noreferrer" className={BUTTON}>
              Open in Google Calendar <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : event.href ? (
            <Link href={event.href} className={BUTTON}>Open</Link>
          ) : null}
          {event.editHref && event.editHref !== event.href && (
            <Link href={event.editHref} className={BUTTON}>Edit</Link>
          )}

          {item.draggable && !moveOpen && (
            <button type="button" onClick={() => setMoveOpen(true)} className={BUTTON}>Move date/time</button>
          )}
          {item.draggable && moveOpen && (
            <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs" />
              {!item.allDay && (
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs" />
              )}
              <button type="button" onClick={saveMove} className="w-full rounded-lg bg-[#18181B] py-2 text-xs font-black text-white">
                Save new time
              </button>
            </div>
          )}
          {!item.draggable && item.category !== 'external' && (
            <p className="text-xs text-zinc-400">Worked out from your orders - change it from the source record.</p>
          )}
        </div>
      </aside>
    </>
  )
}
