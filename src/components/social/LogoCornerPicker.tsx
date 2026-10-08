'use client'

import {
  type SocialLogoCorner,
  SOCIAL_LOGO_CORNER_LABELS,
  SOCIAL_LOGO_CORNERS,
} from '@/lib/social/socialLogoCorner'

const DOT_POSITION: Record<SocialLogoCorner, string> = {
  'top-left':     'top-0.5 left-0.5',
  'top-right':    'top-0.5 right-0.5',
  'bottom-left':  'bottom-0.5 left-0.5',
  'bottom-right': 'bottom-0.5 right-0.5',
}

export function LogoCornerPicker({
  value,
  onChange,
  disabled,
}: {
  value:    SocialLogoCorner
  onChange: (corner: SocialLogoCorner) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {SOCIAL_LOGO_CORNERS.map((corner) => (
        <button
          key={corner}
          type="button"
          disabled={disabled}
          title={SOCIAL_LOGO_CORNER_LABELS[corner]}
          aria-label={SOCIAL_LOGO_CORNER_LABELS[corner]}
          onClick={() => onChange(corner)}
          className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors ${
            value === corner
              ? 'border-[#FFD700] bg-[#FFFBEA] ring-1 ring-[#FFD700]/40'
              : 'border-[#E0DDD5] bg-white hover:border-[#CCC]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="relative h-9 w-9 rounded border border-[#DDD] bg-[#F5F5F2]">
            <span
              className={`absolute h-2 w-2 rounded-sm bg-[#FFD700] ${DOT_POSITION[corner]}`}
            />
          </div>
          <span className="text-[9px] font-semibold text-[#888] leading-none text-center">
            {SOCIAL_LOGO_CORNER_LABELS[corner].replace(' ', '\u00a0')}
          </span>
        </button>
      ))}
    </div>
  )
}
