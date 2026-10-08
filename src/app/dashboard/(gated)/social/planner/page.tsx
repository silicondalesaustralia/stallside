'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SocialRoutePage } from '@/components/tradiespost/SocialRoutePage'

export default function TradiesPostPlannerPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-[#F5C518]" />}>
      <SocialRoutePage
        tab="planner"
        title="Planner"
        subtitle="Plan your month. Review each week. Approve and schedule."
      />
    </Suspense>
  )
}
