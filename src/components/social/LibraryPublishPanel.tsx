'use client'

import Link from 'next/link'
import { CalendarDays, Copy, Download, Loader2, Zap } from 'lucide-react'
import {
  SOCIAL_PUBLISH_PLATFORM_LABELS,
  SOCIAL_PUBLISH_PLATFORMS,
  libraryAutomaticScheduleAvailable,
  libraryLocalTimezoneLabel,
  libraryPublishUiState,
  shouldShowSquareFormatNote,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { InfoGuide } from '@/components/ui/InfoGuide'
import type { HybridRenderListItem } from '@/lib/social/libraryRenderUtils'

export function LibraryPublishPanel({
  render,
  caption,
  connected,
  selected,
  onTogglePlatform,
  scheduleOpen,
  onScheduleOpen,
  scheduledDate,
  scheduledTime,
  onScheduledDate,
  onScheduledTime,
  publishingMode,
  onPublishingMode,
  submitting,
  error,
  onPostNow,
  onSchedule,
  onDownload,
  onCopy,
}: {
  render: HybridRenderListItem
  caption: string
  connected: SocialConnectionState
  selected: SocialPublishPlatform[]
  onTogglePlatform: (platform: SocialPublishPlatform) => void
  scheduleOpen: boolean
  onScheduleOpen: (open: boolean) => void
  scheduledDate: string
  scheduledTime: string
  onScheduledDate: (value: string) => void
  onScheduledTime: (value: string) => void
  publishingMode: 'automatic' | 'manual'
  onPublishingMode: (mode: 'automatic' | 'manual') => void
  submitting: boolean
  error: string | null
  onPostNow: () => void
  onSchedule: () => void
  onDownload: () => void
  onCopy: () => void
}) {
  const ui = libraryPublishUiState(connected)
  const hasCaption = Boolean(caption.trim())
  const tz = libraryLocalTimezoneLabel()
  const showSizeNote = shouldShowSquareFormatNote(render.platform, selected)
  const autoAvailable = libraryAutomaticScheduleAvailable(selected, connected)

  return (
    <div className="mt-3 border-t border-[#F0EDE5] pt-3 space-y-3" data-testid={`library-publish-${render.id}`}>
      <div>
        <p className="flex items-center gap-0.5 text-[11px] font-semibold text-[#666]">
          Platforms
          <InfoGuide topic="publishTo" />
        </p>
        <div className="mt-1.5 space-y-1.5">
          {SOCIAL_PUBLISH_PLATFORMS.map((platform) => {
            const isConnected = connected[platform]
            const isSelected = selected.includes(platform)
            return (
              <label
                key={platform}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#EDEAE2] bg-white px-2.5 py-1.5 text-[11px]"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onTogglePlatform(platform)}
                  className="accent-[#FFD700]"
                />
                <span className="font-semibold text-[#333]">
                  {SOCIAL_PUBLISH_PLATFORM_LABELS[platform]}
                </span>
                <span className={`ml-auto ${isConnected ? 'text-green-700' : 'text-[#AAA]'}`}>
                  {isConnected ? '✓ Connected' : 'Not connected'}
                </span>
              </label>
            )
          })}
        </div>
        <span className="mt-1.5 inline-flex items-center gap-0.5">
          <Link
            href="/dashboard/social/connections"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#888] hover:text-[#333] hover:underline"
          >
            {ui.showConnectCta ? 'Connect socials' : 'Manage connections'}
          </Link>
          <InfoGuide topic="connectSocials" />
        </span>
      </div>

      {ui.showConnectCta && (
        <div className="rounded-lg bg-[#FFFBEA] px-2.5 py-2">
          <p className="text-[11px] leading-relaxed text-[#555]">
            Connect accounts to post automatically, or schedule manually and post yourself.
          </p>
          <Link
            href="/dashboard/social/connections"
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-black text-[#886600] hover:underline"
          >
            <Zap className="h-3 w-3" /> Connect socials
          </Link>
        </div>
      )}

      {!hasCaption && (
        <p className="text-[11px] font-semibold text-amber-800">Add a caption before publishing.</p>
      )}

      {showSizeNote && (
        <p className="text-[10px] text-[#999]">This image will be published in its current format.</p>
      )}

      {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}

      {!scheduleOpen && (
        <div className="flex flex-wrap gap-1.5">
          {ui.showPostNow && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={onPostNow}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-black px-2.5 py-2 text-[11px] font-bold text-white disabled:opacity-50"
                data-testid={`library-post-now-${render.id}`}
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Post now
              </button>
              <InfoGuide topic="postNow" />
            </>
          )}
          {ui.showSchedule && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => onScheduleOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#EDEAE2] px-2.5 py-2 text-[11px] font-semibold text-[#555] disabled:opacity-50"
                data-testid={`library-schedule-${render.id}`}
              >
                <CalendarDays className="h-3 w-3" />
                Schedule
              </button>
              <InfoGuide topic="schedule" />
            </>
          )}
        </div>
      )}

      {scheduleOpen && (
        <div className="space-y-2 rounded-lg border border-[#EDEAE2] bg-[#FAFAF7] p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] font-semibold text-[#666]">
              Date
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => onScheduledDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#EDEAE2] bg-white px-2 py-1.5 text-[11px] text-[#333]"
              />
            </label>
            <label className="text-[10px] font-semibold text-[#666]">
              Time
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => onScheduledTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#EDEAE2] bg-white px-2 py-1.5 text-[11px] text-[#333]"
              />
            </label>
          </div>
          <p className="text-[10px] text-[#999]">Local time ({tz})</p>

          <div className="space-y-2 border-t border-[#EDEAE2] pt-2">
            <p className="text-[10px] font-bold uppercase text-[#888]">Posting method</p>
            <label className="flex items-start gap-2 text-[11px]">
              <input
                type="radio"
                name={`library-mode-${render.id}`}
                checked={publishingMode === 'automatic'}
                disabled={!autoAvailable}
                onChange={() => onPublishingMode('automatic')}
                className="mt-0.5"
              />
              <span>
                <span className="font-semibold text-[#333]">Automatic</span>
                {!autoAvailable && (
                  <span className="mt-0.5 block text-[10px] text-[#888]">
                    Connect selected platforms to use automatic posting.
                  </span>
                )}
              </span>
            </label>
            <label className="flex items-start gap-2 text-[11px]">
              <input
                type="radio"
                name={`library-mode-${render.id}`}
                checked={publishingMode === 'manual' || !autoAvailable}
                onChange={() => onPublishingMode('manual')}
                className="mt-0.5"
              />
              <span>
                <span className="font-semibold text-[#333]">Manual</span>
                <span className="mt-0.5 block text-[10px] text-[#888]">
                  Add this post to your calendar and post it yourself.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={submitting}
              onClick={onSchedule}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-black px-2.5 py-2 text-[11px] font-bold text-white disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Schedule post
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onScheduleOpen(false)}
              className="rounded-lg border border-[#EDEAE2] bg-white px-2.5 py-2 text-[11px] font-semibold text-[#555]"
            >
              Cancel
            </button>
          </div>
          <p className="text-[10px] text-[#888]">Scheduling: free</p>
        </div>
      )}

      <div>
        <p className="flex items-center gap-0.5 text-[11px] font-semibold text-[#666]">
          Manual download
          <InfoGuide topic="download" />
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1 rounded-lg border border-[#EDEAE2] px-2.5 py-1.5 text-[11px] font-semibold text-[#555]"
          >
            <Download className="h-3 w-3" />
            Download image
          </button>
          {hasCaption && (
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1 rounded-lg border border-[#EDEAE2] px-2.5 py-1.5 text-[11px] font-semibold text-[#555]"
            >
              <Copy className="h-3 w-3" />
              Copy caption
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
