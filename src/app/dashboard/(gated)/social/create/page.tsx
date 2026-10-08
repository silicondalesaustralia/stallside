'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { TradiesPostComposer } from '@/components/tradiespost/composer/TradiesPostComposer'

export default function TradiesPostCreatePage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-[#F5C518]" />}>
      <TradiesPostComposer />
    </Suspense>
  )
}
