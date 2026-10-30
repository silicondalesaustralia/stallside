'use client'

import type { VideoHeadlineFontId } from '@/lib/social/videoBranding/types'
import { VIDEO_HEADLINE_FONTS } from '@/lib/social/videoBranding/videoHeadlineFontCatalog'
import { videoFontCss } from './videoFontCss'

type Props = {
  label: string
  value: VideoHeadlineFontId
  disabled?: boolean
  onChange: (font: VideoHeadlineFontId) => void
}

export function VideoFontSelect({ label, value, disabled, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as VideoHeadlineFontId)}
        style={{ fontFamily: videoFontCss(value) }}
        className="min-w-0 flex-1 rounded-lg border border-tradiespost-border bg-white px-2 py-1.5 text-sm text-tradiespost-text"
      >
        {VIDEO_HEADLINE_FONTS.map((f) => (
          <option key={f.id} value={f.id} style={{ fontFamily: videoFontCss(f.id) }}>
            {f.label}
          </option>
        ))}
      </select>
    </label>
  )
}
