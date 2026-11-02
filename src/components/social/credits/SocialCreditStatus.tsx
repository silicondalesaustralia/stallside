import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'
import type { SocialCreditSummary } from '@/lib/socialCredits/ledger'
import { SOCIAL_CREDIT_KINDS, SOCIAL_CREDIT_LABELS } from '@/lib/socialCredits/packs'
import { CREDIT_THEME } from './creditTheme'

/** Credit balance + "Buy more credits", shown beside the Social tabs on every page. */
export default function SocialCreditStatus({ summary }: { summary: SocialCreditSummary }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="hidden items-center gap-3 sm:flex" aria-label="Credit balance">
        {SOCIAL_CREDIT_KINDS.map((kind) => {
          const Icon = CREDIT_THEME[kind].icon
          const available = summary[kind].available
          const label = SOCIAL_CREDIT_LABELS[kind]
          return (
            <span
              key={kind}
              title={`${available} ${available === 1 ? label.one : label.many} available`}
              className={`flex items-center gap-1 text-sm font-bold ${available === 0 ? 'text-red-600' : 'text-[var(--ink)]'}`}
            >
              <Icon className={`h-4 w-4 ${CREDIT_THEME[kind].chip}`} aria-hidden />
              {available}
              <span className="font-medium text-[var(--muted)]">{available === 1 ? label.one : label.many}</span>
            </span>
          )
        })}
      </div>
      <Link
        href={SOCIAL_PATHS.credits}
        className="flex items-center gap-1 whitespace-nowrap rounded-full bg-tradiespost-gold px-3 py-1.5 text-xs font-black text-tradiespost-black hover:bg-tradiespost-gold-hover"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Buy more credits
      </Link>
    </div>
  )
}
