import { TradiesPostBadge } from '@/components/tradiespost/ui'
import type { BillingCurrency } from '@/lib/saas-pricing'
import { formatPackPrice, socialCreditPackName, type SocialCreditPack } from '@/lib/socialCredits/packs'

type Props = {
  pack: SocialCreditPack
  currency: BillingCurrency
  popular: boolean
  busy: boolean
  disabled: boolean
  onBuy: (pack: SocialCreditPack) => void
}

export default function SocialCreditPackButton({ pack, currency, popular, busy, disabled, onBuy }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onBuy(pack)}
      className="flex w-full items-center justify-between rounded-xl border border-tradiespost-border bg-tradiespost-surface-raised px-4 py-3 text-left transition-colors hover:border-tradiespost-gold/50 hover:bg-tradiespost-gold-highlight disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="flex items-center gap-2 text-sm font-bold text-tradiespost-text">
        {socialCreditPackName(pack)}
        {popular && <TradiesPostBadge>Popular</TradiesPostBadge>}
      </span>
      <span className="text-sm font-black tabular-nums text-tradiespost-text">
        {busy ? 'Processing…' : formatPackPrice(pack, currency)}
      </span>
    </button>
  )
}
