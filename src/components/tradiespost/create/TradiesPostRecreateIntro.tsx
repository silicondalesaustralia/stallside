'use client'

import { TradiesPostCard } from '@/components/tradiespost/ui'

/** Customer-facing framing for the existing Recreate workflow. */
export function TradiesPostRecreateIntro() {
  return (
    <TradiesPostCard padding="md" elevated={false} className="mb-4 bg-[#FFFBEB]/60">
      <h3 className="text-sm font-black uppercase tracking-wide text-[#18181B]">
        Something you like
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Found a post you like? Upload it. TradiesPost takes inspiration from the creative direction
        and creates an original version for your brand - not a copy.
      </p>
    </TradiesPostCard>
  )
}
