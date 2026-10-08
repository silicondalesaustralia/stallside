'use client'

import { TradiesPostCard } from '@/components/tradiespost/ui'
import type { ContentMixRow } from '@/lib/tradiespost/plannerMonthView'

type TradiesPostContentMixSummaryProps = {
  rows: ContentMixRow[]
}

export function TradiesPostContentMixSummary({ rows }: TradiesPostContentMixSummaryProps) {
  if (rows.length === 0) return null

  return (
    <TradiesPostCard padding="md" elevated={false}>
      <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Content mix</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map((row) => (
          <span
            key={row.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
          >
            {row.label}
            <span className="tabular-nums text-[#18181B]">{row.count}</span>
          </span>
        ))}
      </div>
    </TradiesPostCard>
  )
}
