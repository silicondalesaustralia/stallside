'use client'

import {
  PLATFORM_COMING_SOON,
  type SocialComingSoonPlatform,
} from '@/lib/social/platformComingSoonContent'

type TradiesPostConnectionComingSoonProps = {
  platform: SocialComingSoonPlatform
}

/** Approval status copy only - badge and actions live on the parent connection card. */
export function TradiesPostConnectionComingSoon({
  platform,
}: TradiesPostConnectionComingSoonProps) {
  const content = PLATFORM_COMING_SOON[platform]
  const provider = content.approvalProvider

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-[#18181B]">
        {provider} approval in progress.
      </p>
      <p className="text-sm leading-relaxed text-zinc-600">
        Automatic publishing will be available once approval is complete.
      </p>
    </div>
  )
}
