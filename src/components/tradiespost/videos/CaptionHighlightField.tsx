'use client'

import { FALLBACK_HIGHLIGHT_COLOR, normalizeHexColor } from '@/lib/social/videoClips/captionStyles'

type Props = {
  value: string | null
  disabled?: boolean
  onChange: (next: string | null) => void
}

export function CaptionHighlightField({ value, disabled, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
      <label className="flex items-center gap-2">
        Highlight colour
        <input
          type="color"
          value={value ?? FALLBACK_HIGHLIGHT_COLOR}
          disabled={disabled}
          onChange={(e) => onChange(normalizeHexColor(e.target.value))}
          className="h-8 w-10 cursor-pointer rounded border border-tradiespost-border"
        />
      </label>
      {value ? (
        <button type="button" disabled={disabled} onClick={() => onChange(null)} className="text-zinc-500 underline">
          Use my brand colour
        </button>
      ) : (
        <span className="font-normal text-zinc-500">Using your brand colour</span>
      )}
    </div>
  )
}
