'use client'

import {
  CONTENT_FORMATS,
  INFOGRAPHIC_PRESETS,
  INFOGRAPHIC_PRESET_DESCRIPTIONS,
  INFOGRAPHIC_PRESET_LABELS,
  PHOTO_SOURCES,
  PHOTO_SOURCE_LABELS,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'
import { composePillClass } from '@/lib/social/composePillStyles'
import { FORMAT_ACCENTS } from '@/lib/social/socialDesignTokens'
import { InfoGuide } from '@/components/ui/InfoGuide'

export function ComposeAxesPanel({
  contentFormat,
  photoSource,
  infographicPreset,
  onFormatChange,
  onPhotoSourceChange,
  onPresetChange,
}: {
  contentFormat: ContentFormat
  photoSource: PhotoSource
  infographicPreset: InfographicPreset
  onFormatChange: (f: ContentFormat) => void
  onPhotoSourceChange: (s: PhotoSource) => void
  onPresetChange: (p: InfographicPreset) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 flex items-center gap-0.5 text-xs font-semibold text-[#666]">
          Creative format
          <InfoGuide topic="creativeFormat" />
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CONTENT_FORMATS.map((id) => {
            const accent = FORMAT_ACCENTS[id]
            const selected = contentFormat === id
            const Icon = accent.Icon
            return (
              <button
                key={id}
                type="button"
                onClick={() => onFormatChange(id)}
                className={`group relative flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                  selected
                    ? `${accent.surface} ${accent.ring} ring-2 shadow-sm scale-[1.02]`
                    : 'border-[#EDEAE2] bg-white hover:border-[#D5D0C8] hover:shadow-sm'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${accent.badgeBg}`}
                >
                  <Icon className={`h-[18px] w-[18px] ${accent.badgeIcon}`} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#222]">{accent.label}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-[#888]">{accent.blurb}</p>
                </div>
                {selected && (
                  <span
                    className={`absolute right-2.5 top-2.5 h-2 w-2 rounded-full ${accent.dot}`}
                    aria-hidden
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-[#666]">Photo source</p>
        <div className="flex flex-wrap gap-1.5">
          {PHOTO_SOURCES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onPhotoSourceChange(id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 ${composePillClass(photoSource === id)} ${
                photoSource === id ? 'shadow-sm' : 'hover:scale-[1.02]'
              }`}
            >
              {PHOTO_SOURCE_LABELS[id]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-[#999]">
          Format and photo source are independent - any combination works.
        </p>
      </div>

      {contentFormat === 'infographic' && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-[#666]">Infographic layout</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INFOGRAPHIC_PRESETS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onPresetChange(id)}
                className={`rounded-2xl border p-3 text-left transition-all duration-200 ${
                  infographicPreset === id
                    ? 'border-indigo-300 bg-indigo-50/80 ring-2 ring-indigo-400/30 shadow-sm'
                    : 'border-[#EDEAE2] bg-white hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <p className="text-sm font-black text-black">{INFOGRAPHIC_PRESET_LABELS[id]}</p>
                <p className="mt-0.5 text-[11px] text-[#888]">
                  {INFOGRAPHIC_PRESET_DESCRIPTIONS[id]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
