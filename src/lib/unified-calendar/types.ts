import type { CalendarEvent } from '@/lib/calendar/types'
import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'

export type UnifiedCategory =
  | 'social'
  | 'orders'
  | 'fulfilment'
  | 'markets'
  | 'custom'
  | 'production'
  | 'subscriptions'
  | 'external'

export type UnifiedView = 'month' | 'week'

type UnifiedItemBase = {
  id: string
  category: UnifiedCategory
  title: string
  /** ISO instants. */
  startsAt: string
  endsAt: string | null
  allDay: boolean
  /** Owner can drag it to a new day/time (writes the source record). */
  draggable: boolean
}

export type UnifiedEventItem = UnifiedItemBase & { kind: 'event'; event: CalendarEvent }
export type UnifiedPostItem = UnifiedItemBase & { kind: 'post'; post: SocialCalendarPost }
export type UnifiedItem = UnifiedEventItem | UnifiedPostItem

/** Drop / create target: a whole day (month cell, all-day row) or a day + hour (week grid). */
export type UnifiedSlot = { dayKey: string; hour: number | null }

export type UnifiedMoveTimes = { startsAt: string; endsAt: string | null }
