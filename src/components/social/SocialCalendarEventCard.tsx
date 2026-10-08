'use client'

import { ImageIcon } from 'lucide-react'
import {
  calendarEventAriaLabel,
  formatPlatformList,
} from '@/lib/social/socialCalendarGrid'
import {
  calendarPostTitle,
  formatCalendarPostTime,
  postingModeLabel,
} from '@/lib/social/socialCalendar'
import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'

type Props = {
  post: SocialCalendarPost
  timeZone: string
  selected: boolean
  compact?: boolean
  onSelect: () => void
}

export function SocialCalendarEventCard({
  post,
  timeZone,
  selected,
  compact = false,
  onSelect,
}: Props) {
  const manual = post.publishing_mode === 'manual'
  const time = post.scheduled_for ? formatCalendarPostTime(post.scheduled_for, timeZone) : ''
  const title = calendarPostTitle(post.caption)
  const platforms = formatPlatformList(post.platforms)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={calendarEventAriaLabel(post, timeZone)}
      aria-pressed={selected}
      className={`mb-0.5 flex w-full min-w-0 overflow-hidden rounded border text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#FFD700] ${
        selected
          ? 'border-[#FFD700] bg-[#FFFBEA] ring-1 ring-[#FFD700]/40'
          : manual
            ? 'border-blue-100 bg-blue-50/80 hover:border-blue-200'
            : 'border-purple-100 bg-purple-50/80 hover:border-purple-200'
      } ${compact ? 'p-2' : 'p-1'}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
        <div className="flex min-w-0 items-center justify-between gap-1">
          <span className="truncate text-[10px] font-semibold text-[#333]">{time}</span>
          <span
            className={`shrink-0 text-[9px] font-bold uppercase tracking-wide ${
              manual ? 'text-blue-700' : 'text-purple-700'
            }`}
          >
            {postingModeLabel(post.publishing_mode)}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-1">
          {post.photo_urls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.photo_urls[0]}
              alt=""
              className={`shrink-0 rounded object-cover ${compact ? 'h-8 w-8' : 'h-5 w-5'}`}
            />
          ) : (
            <div
              className={`flex shrink-0 items-center justify-center rounded bg-[#EDEAE2] ${
                compact ? 'h-8 w-8' : 'h-5 w-5'
              }`}
            >
              <ImageIcon className="h-3 w-3 text-[#AAA]" />
            </div>
          )}
          <span className="min-w-0 truncate text-[10px] font-semibold leading-tight text-[#222]">
            {title}
          </span>
        </div>
        <p className="truncate text-[9px] text-[#888]">{platforms}</p>
      </div>
    </button>
  )
}
