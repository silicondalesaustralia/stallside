'use client'

import { safeBrandColor } from '@/lib/social/tiktokSlides/slideSvg'
import { parseAccentColor } from '@/lib/social/slideshow/slideshowTypes'

type Props = {
  brandColor: string | null
  /** null = brand colour. */
  value: string | null
  disabled: boolean
  onChange: (color: string | null) => void
}

const PRESETS = [
  { label: 'White', color: '#FFFFFF' },
  { label: 'Yellow', color: '#F5C518' },
  { label: 'Red', color: '#E11D48' },
  { label: 'Green', color: '#22C55E' },
  { label: 'Blue', color: '#3B82F6' },
]

const swatch = 'h-6 w-6 rounded-full border border-zinc-300 disabled:opacity-50'
const ring = 'ring-2 ring-[#18181B] ring-offset-2'

export function SlideshowAccentPicker({ brandColor, value, disabled, onChange }: Props) {
  const brand = safeBrandColor(brandColor).toUpperCase()
  const current = value ?? brand

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#18181B]" data-testid="slideshow-accent">
      Underline colour
      <button
        type="button"
        title="Brand colour"
        aria-label="Brand colour"
        disabled={disabled}
        onClick={() => onChange(null)}
        className={`${swatch} ${value === null ? ring : ''}`}
        style={{ backgroundColor: brand }}
      />
      {PRESETS.filter((p) => p.color !== brand).map((p) => (
        <button
          key={p.color}
          type="button"
          title={p.label}
          aria-label={p.label}
          disabled={disabled}
          onClick={() => onChange(p.color)}
          className={`${swatch} ${value === p.color ? ring : ''}`}
          style={{ backgroundColor: p.color }}
        />
      ))}
      <label className="flex items-center gap-1 text-xs font-semibold text-zinc-600">
        Custom
        <input
          type="color"
          value={current}
          disabled={disabled}
          onChange={(e) => onChange(parseAccentColor(e.target.value))}
          className="h-6 w-8 cursor-pointer rounded border border-zinc-300 bg-white p-0 disabled:opacity-50"
        />
      </label>
    </div>
  )
}
