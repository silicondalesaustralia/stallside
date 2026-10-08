'use client'

import {
  SOCIAL_PUBLISH_PLATFORM_LABELS,
  SOCIAL_PUBLISH_PLATFORMS,
  libraryLocalTimezoneLabel,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { automaticPostingAvailable } from '@/lib/social/weekPlan/weekPlanPermissions'

export function PlannerScheduleForm({
  itemId,
  connected,
  selectedPlatforms,
  onTogglePlatform,
  scheduledDate,
  scheduledTime,
  onScheduledDate,
  onScheduledTime,
  publishingMode,
  onPublishingMode,
  onSubmit,
  onCancel,
  submitting,
  submitLabel = 'Add to Calendar',
}: {
  itemId: string
  connected: SocialConnectionState
  selectedPlatforms: SocialPublishPlatform[]
  onTogglePlatform: (platform: SocialPublishPlatform) => void
  scheduledDate: string
  scheduledTime: string
  onScheduledDate: (value: string) => void
  onScheduledTime: (value: string) => void
  publishingMode: 'automatic' | 'manual'
  onPublishingMode: (mode: 'automatic' | 'manual') => void
  onSubmit: () => void
  onCancel?: () => void
  submitting: boolean
  submitLabel?: string
}) {
  const autoAvailable = automaticPostingAvailable(selectedPlatforms, connected)
  const effectiveMode = autoAvailable ? publishingMode : 'manual'

  return (
    <div className="w-full space-y-3 rounded-xl border border-[#EDEAE2] p-3">
      <p className="text-xs font-bold text-[#666]">Add to Calendar</p>
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => onScheduledDate(e.target.value)}
          className="rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
        />
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => onScheduledTime(e.target.value)}
          className="rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
        />
      </div>
      <p className="text-[10px] text-[#888]">Times in {libraryLocalTimezoneLabel()}</p>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase text-[#888]">Platforms</p>
        {SOCIAL_PUBLISH_PLATFORMS.map((platform) => (
          <label key={platform} className="flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={selectedPlatforms.includes(platform)}
              onChange={() => onTogglePlatform(platform)}
            />
            {SOCIAL_PUBLISH_PLATFORM_LABELS[platform]}
            {!connected[platform] && (
              <span className="text-[10px] text-[#888]">Not connected</span>
            )}
          </label>
        ))}
      </div>

      <div className="space-y-2 border-t border-[#EDEAE2] pt-2">
        <p className="text-[10px] font-bold uppercase text-[#888]">Posting method</p>
        <label className="flex items-start gap-2 text-xs">
          <input
            type="radio"
            name={`planner-mode-${itemId}`}
            checked={effectiveMode === 'automatic'}
            disabled={!autoAvailable}
            onChange={() => onPublishingMode('automatic')}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">Automatic</span>
            {!autoAvailable && (
              <span className="mt-0.5 block text-[10px] text-[#888]">
                Connect selected platforms to use automatic posting.
              </span>
            )}
          </span>
        </label>
        <label className="flex items-start gap-2 text-xs">
          <input
            type="radio"
            name={`planner-mode-${itemId}`}
            checked={effectiveMode === 'manual' || !autoAvailable}
            onChange={() => onPublishingMode('manual')}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">Manual</span>
            <span className="mt-0.5 block text-[10px] text-[#888]">
              Add this post to your Calendar and post it yourself.
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="rounded-xl bg-black px-4 py-2 text-sm font-black text-white disabled:opacity-50"
        >
          {submitting ? 'Scheduling…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="rounded-xl border border-[#EDEAE2] px-4 py-2 text-sm font-semibold text-[#555]"
          >
            Cancel
          </button>
        )}
      </div>
      <p className="text-[10px] text-[#888]">Scheduling: free · No social connection required for Manual</p>
    </div>
  )
}
