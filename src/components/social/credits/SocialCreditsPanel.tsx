'use client'

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
          <section
            key={kind}
            className="overflow-hidden rounded-2xl border border-tradiespost-border bg-tradiespost-surface-raised shadow-elevation-rest"
          >
            <SocialCreditBalance kind={kind} balance={view.summary[kind]} />
            <div className="space-y-2 p-4">
              <p className="px-1 text-xs font-bold uppercase tracking-wide text-tradiespost-text-muted">
                Top up {SOCIAL_CREDIT_LABELS[kind].many}
              </p>
              {SOCIAL_CREDIT_PACKS.filter((p) => p.kind === kind).map((pack, i) => (
                <SocialCreditPackButton
                  key={pack.id}
                  pack={pack}
                  currency={view.currency}
                  popular={i === 1}
                  busy={busyPackId === pack.id}
                  disabled={busyPackId !== null}
                  onBuy={buy}
                />
              ))}
            </div>
          </section>
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
