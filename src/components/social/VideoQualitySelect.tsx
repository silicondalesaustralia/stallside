'use client'

import { VIDEO_QUALITIES, VIDEO_QUALITY_LABELS, parseVideoQuality, type VideoQuality } from '@/lib/social/videoQuality'

type Props = {
  value: VideoQuality
  onChange: (next: VideoQuality) => void
  disabled?: boolean
  className?: string
  labelClassName?: string
  testId?: string
}

export const VIDEO_QUALITY_HINT = 'Auto renders fastest. Pick 720p or 1080p for a sharper, larger file.'

export function VideoQualitySelect({ value, onChange, disabled, className, labelClassName, testId }: Props) {
  return (
    <label className="block">
      <span className={labelClassName ?? 'mb-1.5 block text-xs font-semibold text-[#444]'}>Video quality</span>
      <select
        className={className ?? 'min-h-[44px] w-full rounded-lg border border-[#E0DDD5] bg-white px-2 text-xs font-semibold text-[#444]'}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseVideoQuality(e.target.value))}
        data-testid={testId}
      >
        {VIDEO_QUALITIES.map((q) => (
          <option key={q} value={q}>
            {VIDEO_QUALITY_LABELS[q]}
          </option>
        ))}
      </select>
    </label>
  )
}
