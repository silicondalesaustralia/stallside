'use client'

import { ImageIcon } from 'lucide-react'
import { TradiesPostStatusBadge } from '@/components/tradiespost/ui/TradiesPostStatusBadge'
import { calendarPlatformLabels } from '@/lib/tradiespost/calendarMonthView'
import {
  calendarPostTitle,
  formatCalendarPostTime,
  postingModeLabel,
} from '@/lib/social/socialCalendar'
import { calendarEventAriaLabel } from '@/lib/social/socialCalendarGrid'
import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'

type TradiesPostCalendarEventCardProps = {
  post: SocialCalendarPost
  timeZone: string
  selected: boolean
  compact?: boolean
  mini?: boolean
  onSelect: () => void
}

export function TradiesPostCalendarEventCard({
  post,
  timeZone,
  selected,
  compact = false,
  mini = false,
  onSelect,
}: TradiesPostCalendarEventCardProps) {
  const manual = post.publishing_mode === 'manual'
  const time = post.scheduled_for ? formatCalendarPostTime(post.scheduled_for, timeZone) : ''
  const title = calendarPostTitle(post.caption)
  const platforms = calendarPlatformLabels(post.platforms)

  if (mini) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={calendarEventAriaLabel(post, timeZone)}
        className={`flex w-full min-w-0 items-center gap-1 rounded-md border px-1 py-0.5 text-left transition-colors ${
          selected
            ? 'border-[#F5C518] bg-[#FFFBEB]'
            : manual
              ? 'border-sky-200 bg-sky-50/90 hover:border-sky-300'
              : 'border-violet-200 bg-violet-50/90 hover:border-violet-300'
        }`}
      >
        {post.photo_urls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.photo_urls[0]} alt="" className="h-4 w-4 shrink-0 rounded object-cover" />
        ) : (
          <span className="h-4 w-4 shrink-0 rounded bg-zinc-200" />
        )}
        <span className="min-w-0 truncate text-[9px] font-semibold text-[#18181B]">{time}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={calendarEventAriaLabel(post, timeZone)}
      aria-pressed={selected}
      className={`flex w-full min-w-0 overflow-hidden rounded-xl border text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#F5C518] ${
        selected
          ? 'border-[#F5C518] bg-[#FFFBEB] ring-1 ring-[#F5C518]/30 shadow-sm'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
      } ${compact ? 'p-2' : 'p-2.5'}`}
    >
      <div className="flex min-w-0 flex-1 gap-2">
        {post.photo_urls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.photo_urls[0]}
            alt=""
            className={`shrink-0 rounded-lg object-cover ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg bg-zinc-100 ${
              compact ? 'h-10 w-10' : 'h-12 w-12'
            }`}
          >
            <ImageIcon className="h-4 w-4 text-zinc-400" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold tabular-nums text-[#18181B]">{time}</span>
            <TradiesPostStatusBadge
              status={manual ? 'manual' : 'automatic'}
              label={postingModeLabel(post.publishing_mode)}
              dot
              className="origin-left scale-90"
            />
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-zinc-800">
            {title}
          </p>
          {platforms.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {platforms.map((label) => (
                <span
                  key={label}
                  className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-600"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
