'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { TradiesPostPostsPage } from '@/components/tradiespost/posts/TradiesPostPostsPage'

export default function TradiesPostPostsRoute() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-[#F5C518]" />}>
      <TradiesPostPostsPage />
    </Suspense>
  )
}
