'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import {
  COMPOSER_PUBLISH_PLATFORMS,
  SOCIAL_PUBLISH_PLATFORM_LABELS,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'

type Props = {
  selected: SocialPublishPlatform[]
  connected: SocialConnectionState
  onToggle: (platform: SocialPublishPlatform) => void
}

export function ComposerPlatformChips({ selected, connected, onToggle }: Props) {
  const anyDisconnected = COMPOSER_PUBLISH_PLATFORMS.some((p) => !connected[p])

  return (
    <div data-testid="composer-platforms">
      <div className="flex flex-wrap gap-2">
        {COMPOSER_PUBLISH_PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform)
          const isConnected = connected[platform]
          return (
            <button
              key={platform}
              type="button"
              onClick={() => onToggle(platform)}
              aria-pressed={isSelected}
              data-testid={`composer-platform-${platform}`}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 px-4 text-sm font-bold transition-colors ${
                isSelected
                  ? 'border-[#F5C518] bg-[#FFF8DB] text-[#18181B]'
                  : 'border-[#E4E4E7] bg-white text-zinc-600 hover:border-zinc-300'
              } ${isConnected ? '' : 'opacity-60'}`}
            >
              {isSelected && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
              {SOCIAL_PUBLISH_PLATFORM_LABELS[platform]}
              {!isConnected && (
                <span className="text-[10px] font-semibold text-zinc-400">Not connected</span>
              )}
            </button>
          )
        })}
      </div>
      {anyDisconnected && (
        <p className="mt-2 text-xs text-zinc-500">
          Not connected platforms can only be scheduled to post manually.{' '}
          <Link href="/dashboard/social/connections" className="font-bold text-[#18181B] underline">
            Connect accounts
          </Link>
        </p>
      )}
    </div>
  )
}
