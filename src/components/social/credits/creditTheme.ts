import { Film, Sparkles, type LucideIcon } from 'lucide-react'
import type { SocialCreditKind } from '@/lib/socialCredits/packs'

export const CREDIT_ICON: Record<SocialCreditKind, LucideIcon> = {
  design: Sparkles,
  clip: Film,
}
