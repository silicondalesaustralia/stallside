'use client'

import { ImageIcon, Video } from 'lucide-react'
import { TradiesPostSelectableCard } from '@/components/tradiespost/ui/TradiesPostSelectableCard'
import {
  DEFAULT_SOCIAL_CREATION_MODE,
  SOCIAL_CREATION_MODES,
  type SocialCreationMode,
} from '@/lib/social/socialCreateModes'

type Props = {
  value: SocialCreationMode
  onChange: (mode: SocialCreationMode) => void
  variant?: 'default' | 'tradiespost'
}

const MODE_ICONS = {
  images: ImageIcon,
  video: Video,
} as const

export function SocialCreationModeSelector({ value, onChange, variant = 'default' }: Props) {
  if (variant === 'tradiespost') {
    return (
      <div
        className="mb-4 grid grid-cols-2 gap-2 sm:gap-3"
        role="tablist"
        aria-label="Create content type"
        data-testid="social-creation-mode-selector"
      >
        {SOCIAL_CREATION_MODES.map((mode) => {
          const selected = value === mode.id
          const Icon = MODE_ICONS[mode.id]
          return (
            <TradiesPostSelectableCard
              key={mode.id}
              selected={selected}
              onClick={() => onChange(mode.id)}
              testId={`social-creation-mode-${mode.id}`}
              ariaLabel={mode.label}
              className="flex min-h-[52px] flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3.5 text-center sm:min-h-[56px] sm:flex-row sm:gap-2 sm:px-4"
            >
              <Icon className="h-5 w-5 shrink-0 text-[#18181B]" aria-hidden />
              <span className="text-sm font-black text-[#18181B]">{mode.label}</span>
            </TradiesPostSelectableCard>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="mb-4 grid grid-cols-2 gap-2 sm:gap-3"
      role="tablist"
      aria-label="Create content type"
      data-testid="social-creation-mode-selector"
    >
      {SOCIAL_CREATION_MODES.map((mode) => {
        const selected = value === mode.id
        const Icon = MODE_ICONS[mode.id]
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={selected}
            data-testid={`social-creation-mode-${mode.id}`}
            onClick={() => onChange(mode.id)}
            className={`flex min-h-[52px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-3.5 text-center transition sm:min-h-[56px] sm:flex-row sm:gap-2 sm:px-4 ${
              selected
                ? 'border-[#FFD700] bg-[#FFFBEA] shadow-sm'
                : 'border-[#EDEAE2] bg-white hover:border-[#E0DDD5] hover:bg-[#FAFAF8]'
            }`}
          >
            <Icon
              className={`h-5 w-5 shrink-0 ${selected ? 'text-black' : 'text-[#888]'}`}
              aria-hidden
            />
            <span
              className={`text-sm font-black ${selected ? 'text-black' : 'text-[#666]'}`}
            >
              {mode.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { DEFAULT_SOCIAL_CREATION_MODE }
