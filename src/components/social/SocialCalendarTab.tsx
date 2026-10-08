'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { InfoGuideLabel } from '@/components/ui/InfoGuide'
import { SocialCalendarEventCard } from '@/components/social/SocialCalendarEventCard'
import { SocialCalendarEventDrawer } from '@/components/social/SocialCalendarEventDrawer'
import {
  defaultCalendarWeekStart,
  filterCalendarPostsByMode,
  filterUpcomingCalendarPosts,
  formatCalendarPostTime,
  formatCalendarWeekHeading,
  scheduledDateKey,
  shiftCalendarWeek,
} from '@/lib/social/socialCalendar'
import {
  assignPostsToWeekGrid,
  buildCalendarHourRange,
  formatCompactDayHeader,
  formatHourLabel,
  groupPostsForMobileAgenda,
  postsScheduledInWeek,
  resolveCalendarHourRange,
} from '@/lib/social/socialCalendarGrid'
import { weekDateRange, mondayOfWeekContaining, resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import {
  dateKeyInTimeZone,
  getZonedHourMinute,
  localDateTimeToUtc,
} from '@/lib/utils/australiaSydneyTime'
import type { SocialProductVariant } from '@/components/tradiespost/SocialProductVariant'
import {
  TradiesPostCalendarMonthAgenda,
  TradiesPostCalendarMonthGrid,
} from '@/components/tradiespost/calendar/TradiesPostCalendarMonthGrid'
import { TradiesPostCalendarEventCard } from '@/components/tradiespost/calendar/TradiesPostCalendarEventCard'
import {
  TradiesPostCalendarEmptyState,
} from '@/components/tradiespost/calendar/TradiesPostCalendarEmptyState'
import {
  TradiesPostCalendarToolbar,
  type TradiesPostCalendarViewMode,
} from '@/components/tradiespost/calendar/TradiesPostCalendarToolbar'
import {
  defaultCalendarMonthAnchor,
  formatCalendarMonthHeading,
  postsScheduledInMonth,
  shiftCalendarMonth,
} from '@/lib/tradiespost/calendarMonthView'

export type SocialCalendarPost = {
  id: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed' | 'cancelled'
  publishing_mode?: 'automatic' | 'manual' | null
  caption: string | null
  platforms: string[]
  photo_urls: string[]
  scheduled_for: string | null
  week_plan_item_id?: string | null
}

export function SocialCalendarTab({
  posts,
  timeZone,
  initialWeekStart,
  initialPostId,
  onRefresh,
  onClearPostDeepLink,
  variant = 'stitchedup',
  plannerHref = '/dashboard/social?tab=planner',
  createHref = '/dashboard/social?tab=create',
}: {
  posts: SocialCalendarPost[]
  timeZone: string
  initialWeekStart?: string | null
  initialPostId?: string | null
  onRefresh: () => void
  onClearPostDeepLink?: () => void
  variant?: SocialProductVariant
  plannerHref?: string
  createHref?: string
}) {
  const isTradiesPost = variant === 'tradiespost'
  const { toast } = useToast()
  const tz = resolveBusinessTimeZone(timeZone)
  const [filter, setFilter] = useState<'all' | 'automatic' | 'manual'>('all')
  const [viewMode, setViewMode] = useState<TradiesPostCalendarViewMode>(
    isTradiesPost ? 'month' : 'week',
  )
  const [monthAnchor, setMonthAnchor] = useState(() => defaultCalendarMonthAnchor(tz))
  const [weekStart, setWeekStart] = useState(() => {
    const seed = initialWeekStart ?? defaultCalendarWeekStart(tz)
    return mondayOfWeekContaining(seed, tz)
  })
  const [selectedPost, setSelectedPost] = useState<SocialCalendarPost | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('09:00')
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const consumedInitialPostId = useRef<string | null>(null)

  const upcoming = useMemo(() => {
    const base = filterUpcomingCalendarPosts(posts)
    return filterCalendarPostsByMode(base, filter)
  }, [posts, filter])

  const weekDays = useMemo(() => weekDateRange(weekStart, tz), [weekStart, tz])
  const todayKey = dateKeyInTimeZone(new Date(), tz)
  const weekPosts = useMemo(
    () => postsScheduledInWeek(upcoming, weekDays, tz),
    [upcoming, weekDays, tz],
  )

  const monthPosts = useMemo(
    () => postsScheduledInMonth(upcoming, monthAnchor, tz),
    [upcoming, monthAnchor, tz],
  )

  const visiblePosts = viewMode === 'month' ? monthPosts : weekPosts

  const EventCard = isTradiesPost ? TradiesPostCalendarEventCard : SocialCalendarEventCard

  const { startHour, endHourExclusive } = useMemo(
    () => resolveCalendarHourRange(weekPosts, weekDays, tz),
    [weekPosts, weekDays, tz],
  )
  const hours = useMemo(
    () => buildCalendarHourRange(startHour, endHourExclusive),
    [startHour, endHourExclusive],
  )
  const grid = useMemo(
    () => assignPostsToWeekGrid(weekPosts, weekDays, tz),
    [weekPosts, weekDays, tz],
  )
  const mobileAgenda = useMemo(
    () => groupPostsForMobileAgenda(upcoming, weekDays, tz),
    [upcoming, weekDays, tz],
  )

  useEffect(() => {
    if (initialWeekStart) {
      setWeekStart(mondayOfWeekContaining(initialWeekStart, tz))
    }
  }, [initialWeekStart, tz])

  useEffect(() => {
    if (!initialPostId) return
    if (consumedInitialPostId.current === initialPostId) return
    const found = upcoming.find((p) => p.id === initialPostId)
    if (found) {
      consumedInitialPostId.current = initialPostId
      setSelectedPost(found)
      if (found.scheduled_for) {
        setWeekStart(mondayOfWeekContaining(scheduledDateKey(found.scheduled_for, tz), tz))
      }
    }
  }, [initialPostId, upcoming, tz])

  async function cancelPost(id: string) {
    if (!confirm('Cancel this scheduled post?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/social/posts/${id}/cancel`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json.error as string) || 'Cancel failed')
      toast('Scheduled post cancelled', 'success')
      setSelectedPost(null)
      onRefresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Cancel failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function markPosted(id: string) {
    if (!confirm('Mark this post as manually posted?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/social/posts/${id}/mark-posted`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json.error as string) || 'Could not mark as posted')
      toast('Marked as posted', 'success')
      setSelectedPost(null)
      onRefresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not mark as posted', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function saveReschedule(post: SocialCalendarPost) {
    if (!rescheduleDate) {
      toast('Pick a date', 'error')
      return
    }
    setBusy(true)
    try {
      const iso = localDateTimeToUtc(rescheduleDate, rescheduleTime || '09:00', tz).toISOString()
      const res = await fetch(`/api/social/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_for: iso }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json.error as string) || 'Reschedule failed')
      toast('Post rescheduled', 'success')
      setRescheduleOpen(false)
      setSelectedPost(null)
      onRefresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Reschedule failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  function openReschedule(post: SocialCalendarPost) {
    if (!post.scheduled_for) return
    setRescheduleDate(dateKeyInTimeZone(post.scheduled_for, tz))
    const { hour, minute } = getZonedHourMinute(post.scheduled_for, tz)
    setRescheduleTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
    setRescheduleOpen(true)
  }

  function copyCaption(text: string) {
    void navigator.clipboard.writeText(text)
    toast('Caption copied', 'success')
  }

  async function downloadImage(url: string) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const ext =
        blob.type.includes('jpeg') || blob.type.includes('jpg')
          ? 'jpg'
          : blob.type.includes('webp')
            ? 'webp'
            : blob.type.includes('png')
              ? 'png'
              : 'jpg'
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `stitchedup-post-${Date.now()}.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
      toast('Image downloaded', 'success')
    } catch {
      toast('Could not download - try again or save from Library', 'error')
    }
  }

  function selectPost(post: SocialCalendarPost) {
    setSelectedPost(post)
    setRescheduleOpen(false)
  }

  function goToday() {
    if (viewMode === 'month') {
      setMonthAnchor(defaultCalendarMonthAnchor(tz))
      return
    }
    setWeekStart(defaultCalendarWeekStart(tz))
  }

  function goPrev() {
    if (viewMode === 'month') {
      setMonthAnchor((m) => shiftCalendarMonth(m, -1, tz))
      return
    }
    setWeekStart((w) => shiftCalendarWeek(w, -1, tz))
  }

  function goNext() {
    if (viewMode === 'month') {
      setMonthAnchor((m) => shiftCalendarMonth(m, 1, tz))
      return
    }
    setWeekStart((w) => shiftCalendarWeek(w, 1, tz))
  }

  const calendarHeading =
    viewMode === 'month'
      ? formatCalendarMonthHeading(monthAnchor, tz)
      : formatCalendarWeekHeading(weekStart, tz)

  return (
    <div className="space-y-3" data-tp-calendar={isTradiesPost ? '1' : undefined}>
      {isTradiesPost ? (
        <TradiesPostCalendarToolbar
          heading={calendarHeading}
          viewMode={viewMode}
          filter={filter}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
          onViewModeChange={setViewMode}
          onFilterChange={setFilter}
          prevLabel={viewMode === 'month' ? 'Previous month' : 'Previous week'}
          nextLabel={viewMode === 'month' ? 'Next month' : 'Next week'}
        />
      ) : (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InfoGuideLabel topic="scheduled" className="text-sm font-black text-[#111]">
          Calendar
        </InfoGuideLabel>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-0.5 rounded-md border border-[#EDEAE2] p-0.5">
            {(['month', 'week'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${
                  viewMode === mode ? 'bg-[#FFD700] text-black' : 'text-[#666]'
                }`}
                data-testid={`calendar-view-${mode}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={viewMode === 'month' ? 'Previous month' : 'Previous week'}
              onClick={goPrev}
              className="rounded-md p-1.5 text-[#666] hover:bg-[#FAFAF8]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="min-w-[140px] text-center text-sm font-semibold text-[#111]">
              {calendarHeading}
            </p>
            <button
              type="button"
              aria-label={viewMode === 'month' ? 'Next month' : 'Next week'}
              onClick={goNext}
              className="rounded-md p-1.5 text-[#666] hover:bg-[#FAFAF8]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="rounded-md px-2 py-1 text-xs font-bold text-[#886600] hover:bg-[#FFFBEA]"
          >
            Today
          </button>
          <div className="flex gap-0.5 rounded-md border border-[#EDEAE2] p-0.5">
            {(['all', 'automatic', 'manual'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${
                  filter === f ? 'bg-black text-white' : 'text-[#666]'
                }`}
              >
                {f === 'all' ? 'All' : f === 'automatic' ? 'Automatic' : 'Manual'}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {viewMode === 'month' ? (
        <div className="relative space-y-4">
          <TradiesPostCalendarMonthGrid
            monthAnchor={monthAnchor}
            timeZone={tz}
            todayKey={todayKey}
            posts={monthPosts}
            selectedPostId={selectedPost?.id ?? null}
            onSelectPost={selectPost}
          />
          {visiblePosts.length === 0 && (
            isTradiesPost ? (
              <TradiesPostCalendarEmptyState
                plannerHref={plannerHref}
                createHref={createHref}
              />
            ) : (
              <SocialCalendarPeriodEmpty createHref={createHref} />
            )
          )}
          <TradiesPostCalendarMonthAgenda
            monthAnchor={monthAnchor}
            timeZone={tz}
            todayKey={todayKey}
            posts={monthPosts}
            selectedPostId={selectedPost?.id ?? null}
            onSelectPost={selectPost}
          />
        </div>
      ) : (
        <>
      {/* Desktop weekly time grid */}
      <div className={`hidden md:block ${isTradiesPost ? 'relative' : ''}`}>
        <div className="overflow-x-auto">
          <div
            className={`min-w-[760px] overflow-hidden rounded-lg border bg-white ${
              isTradiesPost ? 'rounded-2xl border-zinc-200' : 'border-[#EDEAE2]'
            }`}
          >
            <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-[#EDEAE2] bg-[#FAFAF8]">
              <div className="border-r border-[#EDEAE2]" />
              {weekDays.map((dayKey) => {
                const header = formatCompactDayHeader(dayKey, tz, dayKey === todayKey)
                return (
                  <div
                    key={dayKey}
                    className={`min-w-0 border-r border-[#EDEAE2] px-1 py-2 text-center last:border-r-0 ${
                      header.isToday ? 'border-b-2 border-b-[#FFD700] bg-[#FFFBEA]/50' : ''
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                      {header.weekday}
                    </p>
                    <p className="text-xs font-semibold text-[#222]">{header.date}</p>
                    {header.isToday && (
                      <p className="text-[9px] font-bold uppercase tracking-wide text-[#886600]">
                        Today
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-[#F0EDE5] last:border-b-0"
                style={{ minHeight: '52px' }}
              >
                <div className="border-r border-[#F0EDE5] pr-1 pt-1 text-right text-[10px] text-[#AAA]">
                  {formatHourLabel(hour)}
                </div>
                {weekDays.map((dayKey) => {
                  const cellPosts = grid.get(dayKey)?.get(hour) ?? []
                  const isToday = dayKey === todayKey
                  return (
                    <div
                      key={`${dayKey}-${hour}`}
                      className={`min-w-0 overflow-hidden border-r border-[#F0EDE5] p-0.5 last:border-r-0 ${
                        isToday ? 'bg-[#FFFBEA]/20' : ''
                      }`}
                    >
                      {cellPosts.map((post) => (
                        <EventCard
                          key={post.id}
                          post={post}
                          timeZone={tz}
                          selected={selectedPost?.id === post.id}
                          onSelect={() => selectPost(post)}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {weekPosts.length === 0 && isTradiesPost && viewMode === 'week' && (
          <TradiesPostCalendarEmptyState plannerHref={plannerHref} createHref={createHref} />
        )}

        {weekPosts.length === 0 && !isTradiesPost && (
          <SocialCalendarPeriodEmpty createHref={createHref} />
        )}
      </div>

      {/* Mobile agenda */}
      <div className="space-y-4 md:hidden">
        <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#666]">
          <button type="button" onClick={() => setWeekStart((w) => shiftCalendarWeek(w, -1, tz))}>
            Previous week
          </button>
          <span className="text-[#111]">{formatCalendarWeekHeading(weekStart, tz)}</span>
          <button type="button" onClick={() => setWeekStart((w) => shiftCalendarWeek(w, 1, tz))}>
            Next week
          </button>
        </div>

        {mobileAgenda.map(({ dayKey, posts: dayPosts }) => {
          const header = formatCompactDayHeader(dayKey, tz, dayKey === todayKey)
          return (
            <section key={dayKey}>
              <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-[#888]">
                {header.weekday} {header.date}
                {header.isToday ? ' · Today' : ''}
              </h3>
              {dayPosts.length === 0 ? (
                <p className="text-xs text-[#CCC]">No posts</p>
              ) : (
                <div className="space-y-2">
                  {dayPosts.map((post) => (
                    <div key={post.id}>
                      <p className="mb-1 text-[10px] font-semibold text-[#888]">
                        {post.scheduled_for ? formatCalendarPostTime(post.scheduled_for, tz) : ''}
                      </p>
                      <EventCard
                        post={post}
                        timeZone={tz}
                        selected={selectedPost?.id === post.id}
                        compact
                        onSelect={() => selectPost(post)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {weekPosts.length === 0 && isTradiesPost && viewMode === 'week' && (
          <TradiesPostCalendarEmptyState plannerHref={plannerHref} createHref={createHref} />
        )}

        {weekPosts.length === 0 && !isTradiesPost && (
          <SocialCalendarPeriodEmpty createHref={createHref} />
        )}
      </div>
        </>
      )}

      {selectedPost && (
        <SocialCalendarEventDrawer
          post={selectedPost}
          timeZone={tz}
          busy={busy}
          rescheduleOpen={rescheduleOpen}
          rescheduleDate={rescheduleDate}
          rescheduleTime={rescheduleTime}
          onClose={() => {
            setSelectedPost(null)
            setRescheduleOpen(false)
            onClearPostDeepLink?.()
          }}
          onMarkPosted={() => void markPosted(selectedPost.id)}
          onDownload={downloadImage}
          onCopyCaption={copyCaption}
          onOpenReschedule={() => openReschedule(selectedPost)}
          onRescheduleDate={setRescheduleDate}
          onRescheduleTime={setRescheduleTime}
          onSaveReschedule={() => void saveReschedule(selectedPost)}
          onCancelPost={() => void cancelPost(selectedPost.id)}
        />
      )}
    </div>
  )
}

function SocialCalendarPeriodEmpty({ createHref }: { createHref: string }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-[#EDEAE2] bg-[#FAFAF8]/80 px-4 py-3">
      <p className="text-sm font-semibold text-[#111]">No posts planned yet.</p>
      <p className="mt-0.5 text-sm text-[#666]">
        Create a post from your recent work or start planning your week.
      </p>
      <Link
        href={createHref}
        className="mt-2 inline-flex items-center rounded-lg bg-[#FFD100] px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-400"
      >
        Create Post
      </Link>
    </div>
  )
}
