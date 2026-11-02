import type { SocialCreditBalance as Balance } from '@/lib/socialCredits/ledger'
import { SOCIAL_CREDIT_LABELS, type SocialCreditKind } from '@/lib/socialCredits/packs'

type Props = { kind: SocialCreditKind; balance: Balance }

export default function SocialCreditBalance({ kind, balance }: Props) {
  const label = SOCIAL_CREDIT_LABELS[kind]
  return (
    <div>
      <p className="text-3xl font-black text-tradiespost-text">
        {balance.available}
        <span className="ml-2 text-sm font-semibold text-tradiespost-text-muted">
          {balance.available === 1 ? label.one : label.many} available
        </span>
      </p>
      <p className="mt-1 text-xs text-tradiespost-text-muted">
        {balance.allowance > 0 && (
          <>
            {balance.allowanceLeft} of {balance.allowance} included this month (resets monthly) ·{' '}
          </>
        )}
        {balance.purchased} bought (never expire)
      </p>
    </div>
  )
}
