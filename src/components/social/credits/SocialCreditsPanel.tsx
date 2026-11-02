'use client'

import { TradiesPostCard } from '@/components/tradiespost/ui'
import type { SocialCreditsView } from '@/lib/socialCredits/creditsView'
import { SOCIAL_CREDIT_KINDS, SOCIAL_CREDIT_LABELS, SOCIAL_CREDIT_PACKS } from '@/lib/socialCredits/packs'
import SocialCreditBalance from './SocialCreditBalance'
import SocialCreditPackButton from './SocialCreditPackButton'
import { useBuySocialCredits } from './useBuySocialCredits'
import { useCreditCheckoutReturn } from './useCreditCheckoutReturn'

type Props = { view: SocialCreditsView }

export default function SocialCreditsPanel({ view }: Props) {
  useCreditCheckoutReturn()
  const { buy, busyPackId } = useBuySocialCredits(view.savedCard, view.currency)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {SOCIAL_CREDIT_KINDS.map((kind) => (
          <TradiesPostCard key={kind} padding="md" className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-tradiespost-text-muted">
              {SOCIAL_CREDIT_LABELS[kind].title}
            </h2>
            <SocialCreditBalance kind={kind} balance={view.summary[kind]} />
            <div className="space-y-2">
              {SOCIAL_CREDIT_PACKS.filter((p) => p.kind === kind).map((pack) => (
                <SocialCreditPackButton
                  key={pack.id}
                  pack={pack}
                  currency={view.currency}
                  busy={busyPackId === pack.id}
                  disabled={busyPackId !== null}
                  onBuy={buy}
                />
              ))}
            </div>
          </TradiesPostCard>
        ))}
      </div>
      <p className="text-xs text-tradiespost-text-muted">
        {view.savedCard
          ? `Packs are charged to the card on your Vendl subscription (•••• ${view.savedCard.last4}).`
          : 'You will be taken to secure Stripe checkout. Your card is saved for faster top-ups.'}{' '}
        Prices in {view.currency}. Bought credits never expire.
      </p>
    </div>
  )
}
