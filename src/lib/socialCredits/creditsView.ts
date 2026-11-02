import { prisma } from '@/lib/prisma'
import type { BillingCurrency } from '@/lib/saas-pricing'
import { CREDIT_OWNER_SELECT, creditOwnerFromRow } from './creditOwner'
import { creditCurrency } from './packs'
import { loadSocialAccess, type SocialAccessState } from './socialAccess'
import { findSavedCard } from './stripeSavedCard'

export type SocialCreditsView = SocialAccessState & {
  currency: BillingCurrency
  savedCard: { brand: string; last4: string } | null
}

type OwnerAccess = SocialAccessState & {
  currency: BillingCurrency
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export async function loadOwnerSocialAccess(ownerId: string): Promise<OwnerAccess> {
  const row = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    select: { ...CREDIT_OWNER_SELECT, stripeCustomerId: true, stripeSubscriptionId: true, billingCurrency: true },
  })
  const access = await loadSocialAccess(creditOwnerFromRow(row))
  return {
    ...access,
    currency: creditCurrency(row.billingCurrency),
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
  }
}

/** Balances, access and the card a one-click purchase would charge. */
export async function withSavedCard(access: OwnerAccess): Promise<SocialCreditsView> {
  const { stripeCustomerId, stripeSubscriptionId, ...state } = access
  const card = await findSavedCard(stripeCustomerId, stripeSubscriptionId)
  return { ...state, savedCard: card ? { brand: card.brand, last4: card.last4 } : null }
}

export async function loadSocialCreditsView(ownerId: string): Promise<SocialCreditsView> {
  return withSavedCard(await loadOwnerSocialAccess(ownerId))
}
