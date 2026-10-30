'use client'

import { Trash2, X } from 'lucide-react'
import { normalizeHexColor } from '@/lib/social/videoClips/captionStyles'
import {
  MAX_OVERLAY_CHARS,
  OVERLAY_SIZE_RANGE,
  OVERLAY_STYLE_OPTIONS,
  type TextOverlay,
  type TextOverlayStyle,
} from '@/lib/social/videoClips/textOverlays'
import { VideoFontSelect } from './VideoFontSelect'

type Props = {
  overlay: TextOverlay
  disabled?: boolean
  onChange: (patch: Partial<TextOverlay>) => void
  onRemove: () => void
  onClose: () => void
}

const labelClass = 'flex items-center gap-2 text-xs font-semibold text-zinc-600'
const colorClass = 'h-8 w-10 cursor-pointer rounded border border-tradiespost-border'

/** Settings for the selected text overlay. Position it by dragging on the preview. */
export function TextOverlayPanel({ overlay, disabled, onChange, onRemove, onClose }: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-black">Text overlay</p>
        <div className="flex items-center gap-1">
          <button type="button" disabled={disabled} onClick={onRemove} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white hover:text-red-600" aria-label="Delete text overlay">
            <Trash2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white" aria-label="Done editing text overlay">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <input
        value={overlay.text}
        maxLength={MAX_OVERLAY_CHARS}
        disabled={disabled}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full rounded-lg border border-tradiespost-border bg-white px-2 py-1.5 text-sm text-tradiespost-text"
        aria-label="Overlay text"
      />
      <VideoFontSelect label="Font" value={overlay.font} disabled={disabled} onChange={(font) => onChange({ font })} />
      <label className={labelClass}>
        Size
        <input
          type="range"
          min={OVERLAY_SIZE_RANGE.min}
          max={OVERLAY_SIZE_RANGE.max}
          step={0.5}
          value={overlay.size}
          disabled={disabled}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="flex-1 accent-tradiespost-gold"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label className={labelClass}>
          Style
          <select
            value={overlay.style}
            disabled={disabled}
            onChange={(e) => onChange({ style: e.target.value as TextOverlayStyle })}
            className="rounded-lg border border-tradiespost-border bg-white px-2 py-1.5 text-sm"
          >
            {OVERLAY_STYLE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          <input type="checkbox" checked={overlay.bold} disabled={disabled} onChange={(e) => onChange({ bold: e.target.checked })} />
          Bold
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className={labelClass}>
          Text
          <input type="color" value={overlay.color} disabled={disabled} onChange={(e) => onChange({ color: normalizeHexColor(e.target.value) ?? overlay.color })} className={colorClass} />
        </label>
        {overlay.style !== 'plain' ? (
          <label className={labelClass}>
            {overlay.style === 'box' ? 'Box' : 'Outline'}
            <input type="color" value={overlay.accent} disabled={disabled} onChange={(e) => onChange({ accent: normalizeHexColor(e.target.value) ?? overlay.accent })} className={colorClass} />
          </label>
        ) : null}
      </div>
      <p className="text-[11px] text-zinc-500">Drag the text on the preview to position it, and its blue block on the timeline to set when it shows.</p>
    </div>
  )
}
