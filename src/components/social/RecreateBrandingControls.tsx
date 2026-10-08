'use client'

import {
  RecreateLogoPicker,
  type RecreateLogoSelection,
} from '@/components/social/RecreateLogoPicker'
import {
  RECREATE_LOGO_POSITIONS,
  RECREATE_LOGO_POSITION_LABELS,
  RECREATE_LOGO_SIZES,
  RECREATE_LOGO_SIZE_LABELS,
  type RecreateLogoPosition,
  type RecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'
import { InfoGuide } from '@/components/ui/InfoGuide'

const DOT_CLASS: Record<RecreateLogoPosition, string> = {
  top_left: 'top-0.5 left-0.5',
  top_center: 'top-0.5 left-1/2 -translate-x-1/2',
  top_right: 'top-0.5 right-0.5',
  bottom_left: 'bottom-0.5 left-0.5',
  bottom_right: 'bottom-0.5 right-0.5',
}

export type RecreateBrandingValue = RecreateLogoSelection & {
  logoPosition: RecreateLogoPosition
  logoSize: RecreateLogoSize
}

export function RecreateBrandingControls({
  value,
  onChange,
  disabled,
}: {
  value: RecreateBrandingValue
  onChange: (next: RecreateBrandingValue) => void
  disabled?: boolean
}) {
  const noLogo = value.logoAssetId === null

  return (
    <div className="space-y-3" data-testid="recreate-branding-controls">
      <p className="text-xs font-black uppercase tracking-widest text-[#666]">Branding</p>
      <RecreateLogoPicker
        value={value}
        onChange={(next) => onChange({ ...value, ...next })}
        disabled={disabled}
      />
      <div className={noLogo || disabled ? 'pointer-events-none opacity-50' : ''}>
        <p className="mb-1.5 flex items-center gap-0.5 text-xs font-semibold text-[#444]">
          Position
          <InfoGuide topic="logoPlacement" />
        </p>
        <div className="flex flex-wrap gap-1.5">
          {RECREATE_LOGO_POSITIONS.map((position) => {
            const selected = value.logoPosition === position
            return (
              <button
                key={position}
                type="button"
                disabled={disabled || noLogo}
                title={RECREATE_LOGO_POSITION_LABELS[position]}
                aria-label={RECREATE_LOGO_POSITION_LABELS[position]}
                aria-pressed={selected}
                onClick={() => onChange({ ...value, logoPosition: position })}
                className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                    : 'border-[#E0DDD5] bg-white hover:border-indigo-200'
                }`}
                data-testid={`recreate-logo-position-${position}`}
              >
                <div className="relative h-8 w-8 rounded border border-[#DDD] bg-[#F5F5F2]">
                  <span className={`absolute h-2 w-2 rounded-sm bg-indigo-600 ${DOT_CLASS[position]}`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className={noLogo || disabled ? 'pointer-events-none opacity-50' : ''}>
        <p className="mb-1.5 text-xs font-semibold text-[#444]">Size</p>
        <div className="flex gap-1.5">
          {RECREATE_LOGO_SIZES.map((size) => {
            const selected = value.logoSize === size
            return (
              <button
                key={size}
                type="button"
                disabled={disabled || noLogo}
                onClick={() => onChange({ ...value, logoSize: size })}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                    : 'border-[#E0DDD5] bg-white text-[#555] hover:border-indigo-200'
                }`}
                data-testid={`recreate-logo-size-${size}`}
              >
                {RECREATE_LOGO_SIZE_LABELS[size]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
