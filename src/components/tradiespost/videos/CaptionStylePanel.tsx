'use client'

import {
  CAPTION_LOOK_OPTIONS,
  CAPTION_PLACEMENT_OPTIONS,
  CAPTION_SIZE_RANGE,
  CAPTION_STYLE_OPTIONS,
  captionPresetDetails,
  normalizeHexColor,
  parseCaptionStyle,
  type CaptionLook,
  type CaptionPlacement,
  type CaptionSettings,
} from '@/lib/social/videoClips/captionStyles'
import { CaptionHighlightField } from './CaptionHighlightField'
import { VideoFontSelect } from './VideoFontSelect'

type Props = {
  value: CaptionSettings
  disabled?: boolean
  onChange: (next: CaptionSettings) => void
}

const labelClass = 'flex items-center gap-2 text-xs font-semibold text-zinc-600'
const selectClass = 'rounded-lg border border-tradiespost-border bg-white px-2 py-1.5 text-sm'
const colorClass = 'h-8 w-10 cursor-pointer rounded border border-tradiespost-border'

/** Caption styling — a preset as the starting point, then every detail adjustable. */
export function CaptionStylePanel({ value, disabled, onChange }: Props) {
  const set = (patch: Partial<CaptionSettings>) => onChange({ ...value, ...patch })
  const off = value.style === 'none'

  return (
    <div className="space-y-3 rounded-xl border border-tradiespost-border bg-zinc-50/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-black">Captions</p>
        <label className={labelClass}>
          Preset
          <select
            className={selectClass}
            value={value.style}
            disabled={disabled}
            onChange={(e) => {
              const style = parseCaptionStyle(e.target.value)
              onChange(style === 'none' ? { ...value, style } : { ...value, style, ...captionPresetDetails(style) })
            }}
          >
            {CAPTION_STYLE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
      {off ? null : (
        <>
          <VideoFontSelect label="Font" value={value.font} disabled={disabled} onChange={(font) => set({ font })} />
          <label className={labelClass}>
            Size
            <input
              type="range"
              min={CAPTION_SIZE_RANGE.min}
              max={CAPTION_SIZE_RANGE.max}
              step={0.5}
              value={value.size}
              disabled={disabled}
              onChange={(e) => set({ size: Number(e.target.value) })}
              className="flex-1 accent-tradiespost-gold"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className={labelClass}>
              Position
              <select className={selectClass} value={value.position} disabled={disabled} onChange={(e) => set({ position: e.target.value as CaptionPlacement })}>
                {CAPTION_PLACEMENT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Style
              <select className={selectClass} value={value.look} disabled={disabled} onChange={(e) => set({ look: e.target.value as CaptionLook })}>
                {CAPTION_LOOK_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className={labelClass}>
              <input type="checkbox" checked={value.bold} disabled={disabled} onChange={(e) => set({ bold: e.target.checked })} />
              Bold
            </label>
            <label className={labelClass}>
              <input type="checkbox" checked={value.uppercase} disabled={disabled} onChange={(e) => set({ uppercase: e.target.checked })} />
              ALL CAPS
            </label>
            <label className={labelClass}>
              Text
              <input type="color" value={value.textColor} disabled={disabled} onChange={(e) => set({ textColor: normalizeHexColor(e.target.value) ?? value.textColor })} className={colorClass} />
            </label>
            {value.look === 'outline' || value.look === 'box' ? (
              <label className={labelClass}>
                {value.look === 'box' ? 'Box' : 'Outline'}
                <input type="color" value={value.accentColor} disabled={disabled} onChange={(e) => set({ accentColor: normalizeHexColor(e.target.value) ?? value.accentColor })} className={colorClass} />
              </label>
            ) : null}
          </div>
          {value.look === 'box' ? (
            <label className={labelClass}>
              Box opacity
              <input type="range" min={10} max={100} step={5} value={value.boxOpacity} disabled={disabled} onChange={(e) => set({ boxOpacity: Number(e.target.value) })} className="flex-1 accent-tradiespost-gold" />
            </label>
          ) : null}
          <label className={labelClass}>
            <input type="checkbox" checked={value.wordHighlight} disabled={disabled} onChange={(e) => set({ wordHighlight: e.target.checked })} />
            Highlight each word as it’s spoken
          </label>
          {value.wordHighlight ? (
            <CaptionHighlightField value={value.highlightColor} disabled={disabled} onChange={(highlightColor) => set({ highlightColor })} />
          ) : null}
        </>
      )}
    </div>
  )
}
