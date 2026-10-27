'use client'

import Link from 'next/link'
import { formatCompactDayHeader, formatHourLabel } from '@/lib/social/socialCalendarGrid'
import type { UnifiedSlot } from '@/lib/unified-calendar/types'

type Props = {
  slot: UnifiedSlot
  timeZone: string
  onClose: () => void
}

export default function CreateSlotSheet({ slot, timeZone, onClose }: Props) {
  const header = formatCompactDayHeader(slot.dayKey, timeZone, false)
  const options = [
    { href: '/dashboard/social/create', label: 'Social post', hint: 'Create a post and schedule it for this day' },
    { href: '/dashboard/pre-order-pages/new', label: 'Pre-order page', hint: 'Set order-by and pickup times in the pre-order editor' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-labelledby="cal-create-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 id="cal-create-title" className="text-lg font-black text-[#18181B]">Schedule something</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {header.weekday} {header.date}
          {slot.hour !== null ? ` · ${formatHourLabel(slot.hour)}` : ''}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {options.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                onClick={onClose}
                className="block rounded-xl border border-zinc-200 px-4 py-3 hover:border-[#F5C518] hover:bg-[#FFFBEB]"
              >
                <span className="text-sm font-semibold text-[#18181B]">{o.label}</span>
                <span className="mt-0.5 block text-xs text-zinc-500">{o.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
