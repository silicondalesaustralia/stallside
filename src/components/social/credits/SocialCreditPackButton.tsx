import { TradiesPostButton } from '@/components/tradiespost/ui'
import { formatAud, socialCreditPackName, type SocialCreditPack } from '@/lib/socialCredits/packs'

type Props = {
  pack: SocialCreditPack
  busy: boolean
  disabled: boolean
  onBuy: (pack: SocialCreditPack) => void
}

export default function SocialCreditPackButton({ pack, busy, disabled, onBuy }: Props) {
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
      <span className="font-black">{busy ? 'Processing…' : formatAud(pack.priceCents)}</span>
    </TradiesPostButton>
  )
}
