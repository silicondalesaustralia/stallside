'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SocialRoutePage } from '@/components/tradiespost/SocialRoutePage'

export default function TradiesPostLibraryPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-[#F5C518]" />}>
      <SocialRoutePage
        tab="library"
        title="Library"
        subtitle="Your creative asset gallery - images, videos, and captions ready to post."
      />
    </Suspense>
  )
}
