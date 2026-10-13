import type { CalendarEvent } from '@/lib/calendar/types'
import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'
import { calendarPostTitle } from '@/lib/social/socialCalendar'
import { categoryForEventType } from './categories'
import type { UnifiedEventItem, UnifiedItem, UnifiedPostItem } from './types'

function toIso(value: Date | string): string {
  return new Date(value).toISOString()
}

export function eventToUnifiedItem(event: CalendarEvent): UnifiedEventItem {
  return {
    kind: 'event',
    event,
    id: `event:${event.id}`,
    category: categoryForEventType(event.type),
    title: event.title,
    startsAt: toIso(event.startsAt),
    endsAt: event.endsAt ? toIso(event.endsAt) : null,
    allDay: event.allDay,
    draggable: event.editable && event.rescheduleAction !== null,
  }
}

export function postToUnifiedItem(post: SocialCalendarPost, scheduledFor: string): UnifiedPostItem {
  return {
    kind: 'post',
    post,
    id: `post:${post.id}`,
    category: 'social',
    title: calendarPostTitle(post.caption),
    startsAt: toIso(scheduledFor),
    endsAt: null,
    allDay: false,
    draggable: post.status === 'scheduled',
  }
}

export function buildUnifiedItems(
  events: CalendarEvent[],
  posts: SocialCalendarPost[],
): UnifiedItem[] {
  const items: UnifiedItem[] = events.map(eventToUnifiedItem)
  for (const post of posts) {
    if (post.scheduled_for) items.push(postToUnifiedItem(post, post.scheduled_for))
  }
  return items.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}
