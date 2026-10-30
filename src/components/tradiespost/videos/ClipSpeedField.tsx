'use client'

import { Gauge } from 'lucide-react'
import { CLIP_SPEED_OPTIONS, clipSpeedLabel, parseClipSpeed } from '@/lib/social/videoClips/playbackSpeed'

type Props = { value: number; disabled?: boolean; onChange: (speed: number) => void }

/** Speed of the final video (voice + picture); the preview plays at the same speed. */
export function ClipSpeedField({ value, disabled, onChange }: Props) {
  return (
    <label className="flex flex-wrap items-center gap-2 rounded-xl border border-tradiespost-border px-3 py-2 text-sm font-bold text-tradiespost-text">
      <Gauge className="h-4 w-4 text-zinc-500" aria-hidden />
      Video speed
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseClipSpeed(e.target.value))}
        className="rounded-lg border border-tradiespost-border bg-white px-2 py-1 text-sm font-normal disabled:opacity-50"
      >
        {CLIP_SPEED_OPTIONS.map((speed) => (
          <option key={speed} value={speed}>
            {clipSpeedLabel(speed)}
          </option>
        ))}
      </select>
      <span className="text-[11px] font-normal text-zinc-500">Voice stays natural — applied when you save, download or post.</span>
    </label>
  )
}
