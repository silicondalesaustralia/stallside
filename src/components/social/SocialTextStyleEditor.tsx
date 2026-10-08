'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Contrast } from 'lucide-react'
import { SocialFontFamilySelect } from '@/components/social/SocialFontFamilySelect'
import { SocialFontPreviewStyles } from '@/components/social/SocialFontPreviewStyles'
import {
  SOCIAL_COLOR_AUTO,
  SOCIAL_COLOR_SWATCHES,
  SOCIAL_FONT_SIZE_MAX,
  SOCIAL_FONT_SIZE_MIN,
  SOCIAL_TEXT_ELEMENTS,
  clampFontSize,
  formatSocialColorLabel,
  isAutoSocialColor,
  normalizeSocialColor,
  styleBold,
  styleItalic,
  styleUnderline,
  type SocialElementStyle,
  type SocialTextColor,
  type SocialTextElement,
  type SocialTextStyles,
} from '@/lib/social/socialTextStyle'

export function TextStyleColorSwatch({
  color,
  className = 'h-3.5 w-3.5',
}: {
  color: SocialTextColor
  className?: string
}) {
  if (isAutoSocialColor(color)) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-[#999] bg-[#FAFAF7] ${className}`}
        title="Auto colour"
        aria-hidden
      >
        <Contrast className="h-2 w-2 text-[#888]" strokeWidth={2.5} />
      </span>
    )
  }

  const hex = normalizeSocialColor(color)
  const lightBorder = hex.toUpperCase() === '#FFFFFF' || hex.toUpperCase() === '#FFD100'

  return (
    <span
      className={`inline-block shrink-0 rounded-full border ${lightBorder ? 'border-[#CCC]' : 'border-[#D0CCC4]'} ${className}`}
      style={{ backgroundColor: hex }}
      title={hex}
      aria-hidden
    />
  )
}

export function TextStyleSummarySwatches({
  styles,
  elements = ['headline', 'tagline'],
}: {
  styles: SocialTextStyles
  elements?: SocialTextElement[]
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {elements.map((id) => (
        <TextStyleColorSwatch key={id} color={styles[id].color} />
      ))}
    </span>
  )
}

function ElementStyleFields({
  label,
  element,
  style,
  onChange,
  fontPreviewPhrase,
}: {
  label: string
  element: SocialTextElement
  style: SocialElementStyle
  onChange: (next: SocialElementStyle) => void
  fontPreviewPhrase?: string | null
}) {
  const [sizeRaw, setSizeRaw] = useState(String(style.fontSize))

  useEffect(() => {
    setSizeRaw(String(style.fontSize))
  }, [style.fontSize])

  return (
    <div className="space-y-2">
      <SocialFontFamilySelect
        value={style.fontFamily}
        previewPhrase={fontPreviewPhrase}
        onChange={(fontFamily) => onChange({ ...style, fontFamily })}
      />
      <div>
        <label className="text-xs font-medium text-[#666] block mb-1">
          Size ({SOCIAL_FONT_SIZE_MIN}-{SOCIAL_FONT_SIZE_MAX}px)
        </label>
        <input
          type="number"
          min={SOCIAL_FONT_SIZE_MIN}
          max={SOCIAL_FONT_SIZE_MAX}
          value={sizeRaw}
          onChange={(e) => setSizeRaw(e.target.value)}
          onBlur={() => {
            const parsed = parseInt(sizeRaw, 10)
            const clamped = clampFontSize(Number.isFinite(parsed) ? parsed : style.fontSize)
            setSizeRaw(String(clamped))
            onChange({ ...style, fontSize: clamped })
          }}
          className="w-full rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#FFD700]"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-[#666] block mb-1">Emphasis</label>
        <div className="flex gap-1.5">
          {(
            [
              { key: 'bold' as const, label: 'B', title: 'Bold', className: 'font-black' },
              { key: 'italic' as const, label: 'I', title: 'Italic', className: 'italic' },
              { key: 'underline' as const, label: 'U', title: 'Underline', className: 'underline' },
            ] as const
          ).map((btn) => {
            const on =
              btn.key === 'bold'
                ? styleBold(style, element)
                : btn.key === 'italic'
                  ? styleItalic(style)
                  : styleUnderline(style)
            return (
              <button
                key={btn.key}
                type="button"
                title={btn.title}
                aria-label={btn.title}
                aria-pressed={on}
                onClick={() => onChange({ ...style, [btn.key]: !on })}
                className={`h-8 w-8 rounded-md border-2 text-sm ${btn.className} ${
                  on
                    ? 'border-[#FFD700] bg-[#FFFBEA] ring-2 ring-[#FFD700]/40 text-[#111]'
                    : 'border-[#D0CCC4] bg-white text-[#555] hover:border-[#999]'
                }`}
              >
                {btn.label}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#666] block mb-1">Color</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button
            type="button"
            title="Auto (matches photo)"
            onClick={() => onChange({ ...style, color: SOCIAL_COLOR_AUTO })}
            className={`h-7 min-w-[7rem] shrink-0 rounded-md border-2 px-1.5 text-[9px] font-bold transition-shadow ${
              isAutoSocialColor(style.color)
                ? 'border-[#FFD700] ring-2 ring-[#FFD700]/40 bg-[#FAFAF7] text-[#555]'
                : 'border-[#D0CCC4] hover:border-[#999] bg-white text-[#888]'
            }`}
            aria-label="Auto matches photo"
            aria-pressed={isAutoSocialColor(style.color)}
          >
            Auto (matches photo)
          </button>
          {SOCIAL_COLOR_SWATCHES.map((swatch) => {
            const selected =
              !isAutoSocialColor(style.color) &&
              normalizeSocialColor(style.color).toUpperCase() === swatch.hex.toUpperCase()
            return (
              <button
                key={swatch.hex}
                type="button"
                title={`${swatch.label} (${swatch.hex})`}
                onClick={() =>
                  onChange({ ...style, color: normalizeSocialColor(swatch.hex) })
                }
                className={`h-7 w-7 shrink-0 rounded-md border-2 transition-shadow ${
                  selected
                    ? 'border-[#FFD700] ring-2 ring-[#FFD700]/40'
                    : 'border-[#D0CCC4] hover:border-[#999]'
                }`}
                style={{ backgroundColor: swatch.hex }}
                aria-label={`${swatch.label} ${swatch.hex}`}
                aria-pressed={selected}
              />
            )
          })}
        </div>
        {!isAutoSocialColor(style.color) && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={normalizeSocialColor(style.color)}
              onChange={(e) =>
                onChange({ ...style, color: normalizeSocialColor(e.target.value) })
              }
              className="h-9 w-12 cursor-pointer rounded border border-[#E0DDD5] bg-white p-0.5"
              aria-label={`${label} color`}
            />
            <span className="text-xs text-[#888] font-mono">{style.color}</span>
          </div>
        )}
        {isAutoSocialColor(style.color) && (
          <p className="text-[10px] text-[#AAA]">Contrast adjusts to the photo background on generate.</p>
        )}
      </div>
    </div>
  )
}

function ElementStyleRow({
  label,
  element,
  style,
  onChange,
  inline = false,
  fontPreviewPhrase,
}: {
  label: string
  element: SocialTextElement
  style: SocialElementStyle
  onChange: (next: SocialElementStyle) => void
  inline?: boolean
  fontPreviewPhrase?: string | null
}) {
  const [open, setOpen] = useState(false)

  if (inline) {
    return (
      <div className="rounded-xl border border-[#EDEAE2]/80 bg-[#FAFAF8]/60 p-3 space-y-2">
        <p className="text-xs font-semibold text-[#444]">{label}</p>
        <ElementStyleFields
          label={label}
          element={element}
          style={style}
          onChange={onChange}
          fontPreviewPhrase={fontPreviewPhrase}
        />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#E0DDD5] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-[#FAFAF7] transition-colors"
      >
        <span className="text-xs font-semibold text-[#444]">{label}</span>
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-[#AAA] truncate max-w-[180px]">
            {style.fontFamily} · {style.fontSize}px · {formatSocialColorLabel(style.color)}
            {styleBold(style, element) ? ' · B' : ''}
            {styleItalic(style) ? ' · I' : ''}
            {styleUnderline(style) ? ' · U' : ''}
          </span>
          <TextStyleColorSwatch color={style.color} />
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-[#888] transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {open && (
        <div className="border-t border-[#F0EDE5] px-3 py-3 space-y-2 bg-[#FAFAF7]">
          <ElementStyleFields
            label={label}
            element={element}
            style={style}
            onChange={onChange}
            fontPreviewPhrase={fontPreviewPhrase}
          />
        </div>
      )}
    </div>
  )
}

export function SocialTextStyleEditor({
  styles,
  onChange,
  hint,
  elements,
  inline = false,
  fontPreviewPhrase,
}: {
  styles: SocialTextStyles
  onChange: (element: SocialTextElement, next: SocialElementStyle) => void
  hint?: string
  /** Defaults to headline, description, tagline. Scene compose uses headline + tagline only. */
  elements?: SocialTextElement[]
  /** Scene Step 4: always show controls, no per-element accordion. */
  inline?: boolean
  /** Shown after each font name in the picker, e.g. business name or "Aa Bb Cc". */
  fontPreviewPhrase?: string | null
}) {
  const rows = elements
    ? SOCIAL_TEXT_ELEMENTS.filter(({ id }) => elements.includes(id))
    : SOCIAL_TEXT_ELEMENTS

  return (
    <div className={inline ? 'space-y-3' : 'space-y-2'}>
      <SocialFontPreviewStyles />
      {rows.map(({ id, label }) => (
        <ElementStyleRow
          key={id}
          label={label}
          element={id}
          style={styles[id]}
          onChange={(next) => onChange(id, next)}
          inline={inline}
          fontPreviewPhrase={fontPreviewPhrase}
        />
      ))}
      {hint && <p className="text-[10px] text-[#AAA] pt-1">{hint}</p>}
    </div>
  )
}
