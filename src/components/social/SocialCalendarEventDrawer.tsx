'use client'

import { Copy, Download, X } from 'lucide-react'
import {
  formatCalendarDetailHeading,
  formatPlatformList,
} from '@/lib/social/socialCalendarGrid'
import { postingModeLabel } from '@/lib/social/socialCalendar'
import type { SocialCalendarPost } from '@/components/social/SocialCalendarTab'

type Props = {
  post: SocialCalendarPost
  timeZone: string
  busy: boolean
  rescheduleOpen: boolean
  rescheduleDate: string
  rescheduleTime: string
  onClose: () => void
  onMarkPosted: () => void
  onDownload: (url: string) => void
  onCopyCaption: (text: string) => void
  onOpenReschedule: () => void
  onRescheduleDate: (v: string) => void
  onRescheduleTime: (v: string) => void
  onSaveReschedule: () => void
  onCancelPost: () => void
}

export function SocialCalendarEventDrawer({
  post,
  timeZone,
  busy,
  rescheduleOpen,
  rescheduleDate,
  rescheduleTime,
  onClose,
  onMarkPosted,
  onDownload,
  onCopyCaption,
  onOpenReschedule,
  onRescheduleDate,
  onRescheduleTime,
  onSaveReschedule,
  onCancelPost,
}: Props) {
  const manual = post.publishing_mode === 'manual'
  const heading = post.scheduled_for
    ? formatCalendarDetailHeading(post.scheduled_for, timeZone)
    : ''

  return (
    <>
      <button
        type="button"
        aria-label="Close event details"
        className="fixed inset-0 z-40 bg-black/25"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-event-drawer-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-[#EDEAE2] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#F0EDE5] px-4 py-3">
          <div className="min-w-0 pr-2">
            <p id="calendar-event-drawer-title" className="text-sm font-black text-[#111]">
              {postingModeLabel(post.publishing_mode)} post
            </p>
            <p className="mt-0.5 text-xs text-[#888]">{heading}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#AAA]">
              {formatPlatformList(post.platforms)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[#666] hover:bg-[#FAFAF8]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {post.photo_urls?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.photo_urls[0]}
              alt=""
              className="aspect-square w-full object-cover"
            />
          )}
          <div className="space-y-4 p-4">
            {post.caption && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#555]">
                {post.caption}
              </p>
            )}

            {manual && (
              <button
                type="button"
                disabled={busy}
                onClick={onMarkPosted}
                className="w-full rounded-lg bg-black py-2.5 text-sm font-black text-white disabled:opacity-50"
              >
                Mark as posted
              </button>
            )}

            <div className="flex gap-2">
              {post.photo_urls?.[0] && (
                <button
                  type="button"
                  onClick={() => onDownload(post.photo_urls![0])}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#EDEAE2] py-2 text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5" /> Download image
                </button>
              )}
              {post.caption && (
                <button
                  type="button"
                  onClick={() => onCopyCaption(post.caption!)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#EDEAE2] py-2 text-xs font-semibold"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy caption
                </button>
              )}
            </div>

            {!rescheduleOpen ? (
              <button
                type="button"
                disabled={busy}
                onClick={onOpenReschedule}
                className="w-full rounded-lg border border-[#EDEAE2] py-2 text-xs font-semibold text-[#444]"
              >
                Move date/time
              </button>
            ) : (
              <div className="space-y-2 rounded-lg border border-[#EDEAE2] bg-[#FAFAF7] p-3">
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => onRescheduleDate(e.target.value)}
                  className="w-full rounded-lg border border-[#EDEAE2] px-2 py-1.5 text-xs"
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => onRescheduleTime(e.target.value)}
                  className="w-full rounded-lg border border-[#EDEAE2] px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={onSaveReschedule}
                  className="w-full rounded-lg bg-black py-2 text-xs font-black text-white"
                >
                  Save new time
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={onCancelPost}
              className="w-full py-2 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
            >
              Cancel scheduled post
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
