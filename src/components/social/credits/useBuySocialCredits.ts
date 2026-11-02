'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { buySocialCreditPack } from '@/app/dashboard/(gated)/social/credits/actions'
import type { BillingCurrency } from '@/lib/saas-pricing'
import { formatPackPrice, socialCreditPackName, type SocialCreditPack } from '@/lib/socialCredits/packs'

type SavedCard = { brand: string; last4: string } | null

function cardLabel(card: NonNullable<SavedCard>): string {
  return `${card.brand.charAt(0).toUpperCase()}${card.brand.slice(1)} •••• ${card.last4}`
}

/** Saved card first (after a confirm), Stripe Checkout otherwise. */
export function useBuySocialCredits(savedCard: SavedCard, currency: BillingCurrency) {
  const router = useRouter()
  const { toast } = useToast()
  const [busyPackId, setBusyPackId] = useState<string | null>(null)

  async function buy(pack: SocialCreditPack) {
    const name = socialCreditPackName(pack)
    const price = formatPackPrice(pack, currency)
    if (savedCard && !window.confirm(`Buy ${name} for ${price}? We'll charge your ${cardLabel(savedCard)}.`)) return
    setBusyPackId(pack.id)
    try {
      const result = await buySocialCreditPack(pack.id, crypto.randomUUID())
      if (result.status === 'checkout') {
        window.location.assign(result.url)
        return
      }
      if (result.status === 'error') toast(result.error, 'error')
      else if (result.status === 'pending') toast('Payment is processing - your credits will appear shortly.', 'success')
      else toast(`${name} added.`, 'success')
      router.refresh()
    } catch (err) {
      console.error('[socialCredits] buy failed', err)
      toast('Payment could not be started. Please try again.', 'error')
    }
    setBusyPackId(null)
  }

  return { buy, busyPackId }
}
