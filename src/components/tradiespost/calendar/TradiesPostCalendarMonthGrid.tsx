'use client'

import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'
import { TradiesPostCalendarEventCard } from '@/components/tradiespost/calendar/TradiesPostCalendarEventCard'
import {
  buildMonthWeekRows,
  groupPostsByDayKeys,
  isDateInMonth,
} from '@/lib/tradiespost/calendarMonthView'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type TradiesPostCalendarMonthGridProps = {
  monthAnchor: string
  timeZone: string
  todayKey: string
  posts: SocialCalendarPost[]
  selectedPostId: string | null
  onSelectPost: (post: SocialCalendarPost) => void
}

export function TradiesPostCalendarMonthGrid({
  monthAnchor,
  timeZone,
  todayKey,
  posts,
  selectedPostId,
  onSelectPost,
}: TradiesPostCalendarMonthGridProps) {
  const rows = buildMonthWeekRows(monthAnchor, timeZone)
  const allDays = rows.flat()
  const byDay = groupPostsByDayKeys(posts, allDays, timeZone)

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white" data-testid="tp-calendar-month">
      <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-1 py-2 text-center text-[10px] font-black uppercase tracking-wide text-zinc-500"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.charAt(0)}</span>
          </div>
        ))}
      </div>

      {rows.map((week, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-7 border-b border-zinc-100 last:border-b-0">
          {week.map((dayKey) => {
            const inMonth = isDateInMonth(dayKey, monthAnchor)
            const isToday = dayKey === todayKey
            const dayPosts = byDay.get(dayKey) ?? []
            const dayNum = Number(dayKey.split('-')[2])

            return (
              <div
                key={dayKey}
                className={`min-h-[72px] border-r border-zinc-100 p-1 last:border-r-0 sm:min-h-[100px] sm:p-1.5 ${
                  !inMonth ? 'bg-zinc-50/80 text-zinc-400' : 'bg-white'
                } ${isToday ? 'bg-[#FFFBEB]/60 ring-1 ring-inset ring-[#F5C518]/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-0.5">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? 'bg-[#F5C518] text-[#18181B]'
                        : inMonth
                          ? 'text-[#18181B]'
                          : 'text-zinc-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[9px] font-semibold tabular-nums text-zinc-500 sm:hidden">
                      {dayPosts.length}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {dayPosts.slice(0, 4).map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onSelectPost(post)}
                      aria-label="Scheduled post"
                      className={`h-2 w-2 rounded-full ${
                        post.publishing_mode === 'manual' ? 'bg-sky-500' : 'bg-violet-500'
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-1 hidden space-y-1 sm:block">
                  {dayPosts.slice(0, 2).map((post) => (
                    <TradiesPostCalendarEventCard
                      key={post.id}
                      post={post}
                      timeZone={timeZone}
                      selected={selectedPostId === post.id}
                      mini
                      onSelect={() => onSelectPost(post)}
                    />
                  ))}
                  {dayPosts.length > 2 && (
                    <p className="px-0.5 text-[9px] font-semibold text-zinc-500">
                      +{dayPosts.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function TradiesPostCalendarMonthAgenda({
  monthAnchor,
  timeZone,
  todayKey,
  posts,
  selectedPostId,
  onSelectPost,
}: TradiesPostCalendarMonthGridProps) {
  const rows = buildMonthWeekRows(monthAnchor, timeZone)
  const allDays = rows.flat().filter((d) => isDateInMonth(d, monthAnchor))
  const byDay = groupPostsByDayKeys(posts, allDays, timeZone)
  const daysWithPosts = allDays.filter((d) => (byDay.get(d)?.length ?? 0) > 0)

  if (daysWithPosts.length === 0) return null

  return (
    <div className="space-y-4 sm:hidden" data-testid="tp-calendar-month-agenda">
      {daysWithPosts.map((dayKey) => {
        const dayPosts = byDay.get(dayKey) ?? []
        const ms = new Date(`${dayKey}T12:00:00`).getTime()
        const label = new Intl.DateTimeFormat('en-AU', {
          timeZone,
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        }).format(new Date(ms))

        return (
          <section key={dayKey}>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">
              {label}
              {dayKey === todayKey ? ' · Today' : ''}
            </h3>
            <div className="space-y-2">
              {dayPosts.map((post) => (
                <TradiesPostCalendarEventCard
                  key={post.id}
                  post={post}
                  timeZone={timeZone}
                  selected={selectedPostId === post.id}
                  compact
                  onSelect={() => onSelectPost(post)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
