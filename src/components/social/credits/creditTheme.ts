import { Film, Sparkles, type LucideIcon } from 'lucide-react'
import type { SocialCreditKind } from '@/lib/socialCredits/packs'

export type CreditTheme = {
  icon: LucideIcon
  /** Card header band. */
  hero: string
  /** Pack button hover border + price pill. */
  packHover: string
  price: string
  /** Header chip icon colour. */
  chip: string
}

export const CREDIT_THEME: Record<SocialCreditKind, CreditTheme> = {
  design: {
    icon: Sparkles,
    hero: 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500',
    packHover: 'hover:border-violet-400 hover:bg-violet-50',
    price: 'bg-violet-100 text-violet-800',
    chip: 'text-violet-600',
  },
  clip: {
    icon: Film,
    hero: 'bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-500',
    packHover: 'hover:border-sky-400 hover:bg-sky-50',
    price: 'bg-sky-100 text-sky-800',
    chip: 'text-sky-600',
  },
}
