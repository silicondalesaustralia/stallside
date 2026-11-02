import type { SocialCreditBalance as Balance } from '@/lib/socialCredits/ledger'
import { SOCIAL_CREDIT_LABELS, type SocialCreditKind } from '@/lib/socialCredits/packs'
import { CREDIT_THEME } from './creditTheme'

type Props = { kind: SocialCreditKind; balance: Balance }

/** Coloured header band of a credit card: icon, balance and this month's allowance. */
export default function SocialCreditBalance({ kind, balance }: Props) {
  const label = SOCIAL_CREDIT_LABELS[kind]
  const theme = CREDIT_THEME[kind]
  const Icon = theme.icon
  const leftPct = balance.allowance > 0 ? Math.round((balance.allowanceLeft / balance.allowance) * 100) : 0

  return (
    <div className={`${theme.hero} p-5 text-white`}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h2 className="text-sm font-black uppercase tracking-wide">{label.title}</h2>
      </div>
      <p className="mt-4 text-5xl font-black leading-none">
        {balance.available}
        <span className="ml-2 text-base font-semibold text-white/85">
          {balance.available === 1 ? label.one : label.many} available
        </span>
      </p>
      {balance.allowance > 0 && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${leftPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-white/85">
            {balance.allowanceLeft} of {balance.allowance} Pro {label.many} left this month · resets monthly
          </p>
        </div>
      )}
      <p className="mt-1 text-xs text-white/85">
        {balance.purchased} bought {balance.purchased === 1 ? label.one : label.many} · never expire
      </p>
    </div>
  )
}
