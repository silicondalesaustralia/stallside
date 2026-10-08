'use client'

import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

/** Subtle planner link - Build My Week lives primarily on Home and Planner. */
export function TradiesPostBuildMyWeekLink() {
  return (
    <p className="mb-4 text-right text-sm text-zinc-600" data-testid="tp-build-my-week-link">
      Planning ahead?{' '}
      <Link
        href="/dashboard/social/planner?buildWeek=1"
        className="inline-flex items-center gap-1 font-semibold text-[#18181B] underline decoration-[#F5C518]/60 underline-offset-2 hover:decoration-[#F5C518]"
      >
        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
        Build My Week
      </Link>
    </p>
  )
}
