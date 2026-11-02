import type { BillingCurrency } from '@/lib/saas-pricing'
import { formatPackPrice, socialCreditPackName, type SocialCreditPack } from '@/lib/socialCredits/packs'
import { CREDIT_THEME } from './creditTheme'

type Props = {
  pack: SocialCreditPack
  currency: BillingCurrency
  popular: boolean
  busy: boolean
  disabled: boolean
  onBuy: (pack: SocialCreditPack) => void
}

export default function SocialCreditPackButton({ pack, currency, popular, busy, disabled, onBuy }: Props) {
  const theme = CREDIT_THEME[pack.kind]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onBuy(pack)}
      className={`relative flex w-full items-center justify-between rounded-xl border border-tradiespost-border bg-white px-4 py-3 text-left transition-colors disabled:opacity-50 ${theme.packHover}`}
    >
      <span className="flex items-center gap-2 text-sm font-bold text-tradiespost-text">
        {socialCreditPackName(pack)}
        {popular && (
          <span className="rounded-full bg-tradiespost-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-tradiespost-black">
            Popular
          </span>
        )}
      </span>
      <span className={`rounded-full px-3 py-1 text-sm font-black ${theme.price}`}>
        {busy ? 'Processing…' : formatPackPrice(pack, currency)}
      </span>
    </button>
  )
}
