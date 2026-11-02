'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { confirmSocialCreditPurchase } from '@/app/dashboard/(gated)/social/credits/actions'

/** Handles ?session_id / ?cancelled after Stripe Checkout. */
export function useCreditCheckoutReturn() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const cancelled = searchParams.get('cancelled')
    if (!sessionId && !cancelled) return
    router.replace(pathname, { scroll: false })
    if (cancelled) {
      toast('Checkout cancelled - you were not charged.', 'error')
      return
    }
    if (!sessionId) return
    confirmSocialCreditPurchase(sessionId)
      .then(({ ok }) => {
        toast(ok ? 'Credits added - thanks!' : 'Payment received - your credits will appear shortly.', 'success')
        router.refresh()
      })
      .catch((err: unknown) => {
        console.error('[socialCredits] checkout confirm failed', err)
        toast('We could not confirm your payment yet. Refresh in a moment.', 'error')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
}
