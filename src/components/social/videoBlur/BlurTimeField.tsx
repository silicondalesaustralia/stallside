'use client'

import { formatBlurTime } from '@/lib/social/videoBranding/blurRegions'

export function BlurTimeField({
  label,
  value,
  disabled,
  onChange,
  onUseCurrent,
  testId,
}: {
  label: string
  value: number
  disabled?: boolean
  onChange: (seconds: number) => void
  onUseCurrent: () => void
  testId: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-9 text-[11px] font-semibold text-[#666]">{label}</span>
      <input
        type="number"
        min={0}
        step={0.1}
        value={Number(value.toFixed(1))}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value)
          if (Number.isFinite(next)) onChange(next)
        }}
        aria-label={`${label} time in seconds`}
        className="min-h-[36px] w-20 rounded-lg border border-[#E0DDD5] bg-white px-2 text-xs"
        data-testid={testId}
      />
      <span className="text-[10px] text-[#999]">{formatBlurTime(value)}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onUseCurrent}
        className="ml-auto min-h-[36px] rounded-lg border border-[#E0DDD5] bg-white px-2 text-[11px] font-semibold text-[#555] disabled:opacity-50"
      >
        Use playhead
      </button>
    </div>
  )
}
