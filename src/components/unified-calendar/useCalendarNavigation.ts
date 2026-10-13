'use client'

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { dateKeyInTimeZone } from '@/lib/utils/australiaSydneyTime'
import { shiftAnchor } from '@/lib/unified-calendar/range'
import type { UnifiedView } from '@/lib/unified-calendar/types'

/** View + date live in the URL so the server loads exactly the visible range. */
export function useCalendarNavigation(view: UnifiedView, dateKey: string, timeZone: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  function go(nextView: UnifiedView, nextDate: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', nextView)
    params.set('date', nextDate)
    params.delete('calendarWeekStart')
    params.delete('calendarPostId')
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }))
  }

  return {
    pending,
    prev: () => go(view, shiftAnchor(view, dateKey, -1, timeZone)),
    next: () => go(view, shiftAnchor(view, dateKey, 1, timeZone)),
    today: () => go(view, dateKeyInTimeZone(new Date(), timeZone)),
    setView: (nextView: UnifiedView) => go(nextView, dateKey),
    showDay: (dayKey: string) => go('week', dayKey),
  }
}
