'use client'

import Image from 'next/image'
import { TradiesPostCard } from '@/components/tradiespost/ui'
import { TP_ASSETS } from '@/lib/tradiespost/assets'
import type { BuddyPlannerInsight } from '@/lib/tradiespost/buddyPlannerInsights'

type TradiesPostBuddyInsightCardProps = {
  insights: BuddyPlannerInsight[] | null
  /** When false, component renders nothing (current production state). */
  supported?: boolean
}

/**
 * One Buddy insight maximum. Renders only when `supported` and real insights exist.
 */
export function TradiesPostBuddyInsightCard({
  insights,
  supported = false,
}: TradiesPostBuddyInsightCardProps) {
  if (!supported || !insights?.length) return null

  const insight = insights[0]

  return (
    <TradiesPostCard padding="md" className="border-[#F5C518]/25 bg-[#FFFBEB]/50">
      <div className="flex gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <Image
            src={TP_ASSETS.howBuddyBuilds}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">Buddy insight</p>
          <p className="mt-1 text-sm font-semibold text-[#18181B]">{insight.headline}</p>
          {insight.bullets.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-zinc-600">
              {insight.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span aria-hidden className="text-[#F5C518]">
                    •
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </TradiesPostCard>
  )
}
