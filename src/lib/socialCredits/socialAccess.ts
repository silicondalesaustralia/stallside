import { socialDb } from '@/lib/socialHost/socialDb'
import { loadSocialCreditSummary, type SocialCreditSummary } from './ledger'
import type { SocialCreditOwner } from './creditOwner'

export type SocialAccessState = {
  isPro: boolean
  /** Pro always; Free only while they hold bought credits. */
  canUseSocial: boolean
  /** Platform admins: no metering on designs or clips. */
  unlimitedCredits: boolean
  summary: SocialCreditSummary
}

export function socialAccessFromSummary(isPro: boolean, summary: SocialCreditSummary): boolean {
  return isPro || summary.design.purchased > 0 || summary.clip.purchased > 0
}

export async function loadSocialAccess(owner: SocialCreditOwner): Promise<SocialAccessState> {
  const summary = await loadSocialCreditSummary(socialDb(), owner.ownerId, owner.isPro)
  return {
    isPro: owner.isPro,
    canUseSocial: owner.unlimitedCredits || socialAccessFromSummary(owner.isPro, summary),
    unlimitedCredits: owner.unlimitedCredits,
    summary,
  }
}
