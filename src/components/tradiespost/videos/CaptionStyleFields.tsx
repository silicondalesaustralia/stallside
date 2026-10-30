'use client'

import {
  CAPTION_POSITION_OPTIONS,
  CAPTION_STYLE_OPTIONS,
  parseCaptionPosition,
  parseCaptionStyle,
  type CaptionPosition,
  type CaptionStyleId,
} from '@/lib/social/videoClips/captionStyles'

type Value = { style: CaptionStyleId; position: CaptionPosition }

type Props = {
  value: Value
  onChange: (next: Value) => void
  disabled?: boolean
}

const selectClass =
  'w-full rounded-xl border border-tradiespost-border bg-white px-3 py-2.5 text-sm text-tradiespost-text disabled:opacity-60'

export function CaptionStyleFields({ value, onChange, disabled }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-600">Captions</span>
        <select
          className={selectClass}
          value={value.style}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, style: parseCaptionStyle(e.target.value) })}
        >
          {CAPTION_STYLE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-600">Caption position</span>
        <select
          className={selectClass}
          value={value.position}
          disabled={disabled || value.style === 'none'}
          onChange={(e) => onChange({ ...value, position: parseCaptionPosition(e.target.value) })}
        >
          {CAPTION_POSITION_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
