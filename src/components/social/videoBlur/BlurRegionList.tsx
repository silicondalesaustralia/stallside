'use client'

import { Trash2 } from 'lucide-react'
import { BlurTimeField } from '@/components/social/videoBlur/BlurTimeField'
import { formatBlurTime } from '@/lib/social/videoBranding/blurRegions'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

const MIN_LENGTH_SECONDS = 0.1

export function BlurRegionList({
  regions,
  selectedId,
  currentTime,
  duration,
  disabled,
  onSelect,
  onChange,
  onRemove,
}: {
  regions: VideoBlurRegion[]
  selectedId: string | null
  currentTime: number
  duration: number
  disabled?: boolean
  onSelect: (id: string) => void
  onChange: (next: VideoBlurRegion) => void
  onRemove: (id: string) => void
}) {
  const maxTime = duration > 0 ? duration : Number.MAX_SAFE_INTEGER

  function setStart(region: VideoBlurRegion, seconds: number) {
    const start = Math.min(Math.max(0, seconds), region.end - MIN_LENGTH_SECONDS)
    onChange({ ...region, start: Math.max(0, start) })
  }

  function setEnd(region: VideoBlurRegion, seconds: number) {
    const end = Math.max(Math.min(seconds, maxTime), region.start + MIN_LENGTH_SECONDS)
    onChange({ ...region, end })
  }

  if (!regions.length) return null

  return (
    <ul className="space-y-1.5">
      {regions.map((region, index) => {
        const selected = region.id === selectedId
        return (
          <li
            key={region.id}
            className={`rounded-lg border p-2 ${
              selected ? 'border-[#FFD700] bg-[#FFFBEA]' : 'border-[#EDEAE2] bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelect(region.id)}
                className="flex-1 text-left text-xs font-semibold text-[#333]"
              >
                Blur {index + 1} · {formatBlurTime(region.start)} - {formatBlurTime(region.end)}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemove(region.id)}
                aria-label={`Remove blur ${index + 1}`}
                className="rounded-lg p-1.5 text-[#888] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {selected ? (
              <div className="mt-2 space-y-1.5">
                <BlurTimeField
                  label="Start"
                  value={region.start}
                  disabled={disabled}
                  onChange={(s) => setStart(region, s)}
                  onUseCurrent={() => setStart(region, currentTime)}
                  testId={`video-blur-start-${index}`}
                />
                <BlurTimeField
                  label="End"
                  value={region.end}
                  disabled={disabled}
                  onChange={(s) => setEnd(region, s)}
                  onUseCurrent={() => setEnd(region, currentTime)}
                  testId={`video-blur-end-${index}`}
                />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
