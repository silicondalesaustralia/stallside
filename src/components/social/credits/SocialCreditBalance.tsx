import type { SocialCreditBalance as Balance } from '@/lib/socialCredits/ledger'
import { SOCIAL_CREDIT_LABELS, type SocialCreditKind } from '@/lib/socialCredits/packs'
import { CREDIT_ICON } from './creditTheme'

type Props = { kind: SocialCreditKind; balance: Balance }

/** Top of a credit card: icon, balance and this month's Pro allowance. */
export default function SocialCreditBalance({ kind, balance }: Props) {
  const label = SOCIAL_CREDIT_LABELS[kind]
  const Icon = CREDIT_ICON[kind]
  const leftPct = balance.allowance > 0 ? Math.round((balance.allowanceLeft / balance.allowance) * 100) : 0

  return (
    <div className="border-b border-tradiespost-border p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tradiespost-gold-highlight">
          <Icon className="h-4 w-4 text-tradiespost-gold-muted" aria-hidden />
        </span>
        <h2 className="tp-card-title">{label.title}</h2>
      </div>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-black tabular-nums text-tradiespost-text">{balance.available}</span>
        <span className="text-sm font-semibold text-tradiespost-text-muted">
          {balance.available === 1 ? label.one : label.many} available
        </span>
      </p>
      {balance.allowance > 0 && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-tradiespost-surface-muted">
            <div className="h-full rounded-full bg-tradiespost-gold" style={{ width: `${leftPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-tradiespost-text-muted">
            {balance.allowanceLeft} of {balance.allowance} Pro {label.many} left this month · resets monthly
          </p>
        </div>
      )}
      <p className="mt-1 text-xs text-tradiespost-text-muted">
        {balance.purchased} bought {balance.purchased === 1 ? label.one : label.many} · never expire
      </p>
    </div>
  )
}
