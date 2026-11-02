import { socialDb } from '@/lib/socialHost/socialDb'
import { loadSocialCreditSummary, type SocialCreditSummary } from './ledger'
import type { SocialCreditOwner } from './creditOwner'

export type SocialAccessState = {
  isPro: boolean
  /** Pro always; Free only while they hold bought credits. */
  canUseSocial: boolean
  summary: SocialCreditSummary
}

export function socialAccessFromSummary(isPro: boolean, summary: SocialCreditSummary): boolean {
  return isPro || summary.design.purchased > 0 || summary.clip.purchased > 0
}

export async function loadSocialAccess(owner: SocialCreditOwner): Promise<SocialAccessState> {
  const summary = await loadSocialCreditSummary(socialDb(), owner.ownerId, owner.isPro)
  return { isPro: owner.isPro, canUseSocial: socialAccessFromSummary(owner.isPro, summary), summary }
}
