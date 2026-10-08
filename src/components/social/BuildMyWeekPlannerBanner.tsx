'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function BuildMyWeekPlannerBanner() {
  return (
    <section className="mb-4 rounded-2xl border border-[#FFD100]/30 bg-gradient-to-r from-[#FFFBEA]/80 to-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#886600]">
        Plan your whole week
      </p>
      <p className="mt-1 text-sm text-[#666]">
        Build and review several posts at once.
      </p>
      <Link
        href="/dashboard/social?tab=planner&buildWeek=1"
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-black hover:bg-yellow-400 transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        Build My Week
      </Link>
    </section>
  )
}
