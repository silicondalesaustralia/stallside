import { TradiesPostButton } from '@/components/tradiespost/ui'
import type { BillingCurrency } from '@/lib/saas-pricing'
import { formatPackPrice, socialCreditPackName, type SocialCreditPack } from '@/lib/socialCredits/packs'

type Props = {
  pack: SocialCreditPack
  currency: BillingCurrency
  busy: boolean
  disabled: boolean
  onBuy: (pack: SocialCreditPack) => void
}

export default function SocialCreditPackButton({ pack, currency, busy, disabled, onBuy }: Props) {
  return (
    <TradiesPostButton
      type="button"
      variant="secondary"
      surface="light"
      disabled={disabled}
      onClick={() => onBuy(pack)}
      className="w-full justify-between"
    >
      <span>{socialCreditPackName(pack)}</span>
      <span className="font-black">{busy ? 'Processing…' : formatPackPrice(pack, currency)}</span>
    </TradiesPostButton>
  )
}
