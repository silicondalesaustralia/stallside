'use client'

import type { CreativeDirection } from '@/lib/social/creativeDirection'
import { InfoGuideLabel } from '@/components/ui/InfoGuide'

export function CreativeDirectionCard({ direction }: { direction: CreativeDirection }) {
  return (
    <div
      className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm"
      data-testid="creative-direction-card"
    >
      <InfoGuideLabel topic="creativeDirection" className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
        Creative direction
      </InfoGuideLabel>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-[#111]">{direction.lead}</p>
      {direction.chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {direction.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-800"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-[#888]">
        We&apos;ll use this as the brief - not a copy of the original post.
      </p>
    </div>
  )
}
