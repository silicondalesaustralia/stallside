import { Plus } from 'lucide-react'
import { TradiesPostButton } from '@/components/tradiespost/ui'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'
import type { SocialCreditSummary } from '@/lib/socialCredits/ledger'
import { SOCIAL_CREDIT_KINDS, SOCIAL_CREDIT_LABELS } from '@/lib/socialCredits/packs'
import { CREDIT_ICON } from './creditTheme'

/** Credit balance + "Buy more credits", shown beside the Social tabs on every page. */
export default function SocialCreditStatus({ summary }: { summary: SocialCreditSummary }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="hidden items-center gap-3 sm:flex" aria-label="Credit balance">
        {SOCIAL_CREDIT_KINDS.map((kind) => {
          const Icon = CREDIT_ICON[kind]
          const available = summary[kind].available
          const label = SOCIAL_CREDIT_LABELS[kind]
          return (
            <span
              key={kind}
              title={`${available} ${available === 1 ? label.one : label.many} available`}
              className={`flex items-center gap-1 text-sm font-bold tabular-nums ${available === 0 ? 'text-tradiespost-danger' : 'text-tradiespost-text'}`}
            >
              <Icon className="h-4 w-4 text-tradiespost-gold-muted" aria-hidden />
              {available}
              <span className="font-medium text-tradiespost-text-muted">{available === 1 ? label.one : label.many}</span>
            </span>
          )
        })}
      </div>
      <TradiesPostButton
        href={SOCIAL_PATHS.credits}
        size="sm"
        surface="light"
        className="whitespace-nowrap"
        iconLeft={<Plus className="h-3.5 w-3.5" aria-hidden />}
      >
        Buy more credits
      </TradiesPostButton>
    </div>
  )
}
