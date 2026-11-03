'use client'

import { formatBlurTime } from '@/lib/social/videoBranding/blurRegions'
import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

export function BlurTimeline({
  regions,
  selectedId,
  currentTime,
  duration,
  disabled,
  onSeek,
  onSelect,
}: {
  regions: VideoBlurRegion[]
  selectedId: string | null
  currentTime: number
  duration: number
  disabled?: boolean
  onSeek: (time: number) => void
  onSelect: (id: string) => void
}) {
  const safeDuration = duration > 0 ? duration : 1

  return (
    <div className="space-y-1.5">
      <input
        type="range"
        min={0}
        max={safeDuration}
        step={0.1}
        value={Math.min(currentTime, safeDuration)}
        disabled={disabled || duration <= 0}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Video position"
        className="w-full accent-[#FFD700]"
        data-testid="video-blur-scrubber"
      />
      {regions.length ? (
        <div className="relative h-4 rounded bg-[#EDEAE2]" aria-hidden="true">
          {regions.map((region, index) => {
            const left = (region.start / safeDuration) * 100
            const width = Math.max(0.8, ((region.end - region.start) / safeDuration) * 100)
            const selected = region.id === selectedId
            return (
              <button
                key={region.id}
                type="button"
                tabIndex={-1}
                title={`Blur ${index + 1}: ${formatBlurTime(region.start)} - ${formatBlurTime(region.end)}`}
                onClick={() => {
                  onSelect(region.id)
                  onSeek(region.start)
                }}
                className={`absolute top-0.5 h-3 rounded-sm ${
                  selected ? 'bg-[#FFD700]' : 'bg-indigo-400/80'
                }`}
                style={{ left: `${Math.min(left, 99.2)}%`, width: `${Math.min(width, 100 - left)}%` }}
              />
            )
          })}
          <span
            className="pointer-events-none absolute top-0 h-4 w-0.5 bg-black"
            style={{ left: `${Math.min(100, (currentTime / safeDuration) * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}
