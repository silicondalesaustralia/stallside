'use client'

import { ArrowLeft } from 'lucide-react'

export { TRADIESPOST_CREATE_RESET_EVENT, dispatchTradiesPostCreateReset } from '@/lib/tradiespost/createNavigation'

export function TradiesPostBackToCreateOptions({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B6B73] transition-colors hover:text-[#B8860B]"
      data-testid="tp-back-to-create-options"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      <span>Back to Create options</span>
    </button>
  )
}
