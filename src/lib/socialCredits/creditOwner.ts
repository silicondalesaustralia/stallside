import { prisma } from '@/lib/prisma'
import { ownerHasProAccess } from '@/lib/owner-trial'
import { externalAccountIdFor } from '@/lib/socialHost/provisionSocialIdentity'

/** Credits belong to the Vendl owner, shared across all their businesses. */
export type SocialCreditOwner = { ownerId: string; isPro: boolean }

export const CREDIT_OWNER_SELECT = {
  id: true,
  subscriptionPlan: true,
  lifetimeAccess: true,
  subscriptionStatus: true,
  trialEndsAt: true,
  currentPeriodEndsAt: true,
  cancelAtPeriodEnd: true,
  user: { select: { email: true, role: true } },
} as const

type CreditOwnerRow = {
  id: string
  subscriptionPlan: string | null
  lifetimeAccess: boolean
  subscriptionStatus: string
  trialEndsAt: Date | null
  currentPeriodEndsAt: Date | null
  cancelAtPeriodEnd: boolean
  user: { email: string; role: string } | null
}

export function creditOwnerFromRow(row: CreditOwnerRow): SocialCreditOwner {
  return {
    ownerId: row.id,
    isPro: ownerHasProAccess(row, { email: row.user?.email, role: row.user?.role }),
  }
}

/** Vendl business (stand) id -> its owner. */
export async function creditOwnerForAccount(accountId: string): Promise<SocialCreditOwner | null> {
  const stand = await prisma.stand.findUnique({
    where: { id: accountId },
    select: { owner: { select: CREDIT_OWNER_SELECT } },
  })
  return stand?.owner ? creditOwnerFromRow(stand.owner) : null
}

/** Social DB business id -> its Vendl owner. */
export async function creditOwnerForSocialBusiness(socialBusinessId: string): Promise<SocialCreditOwner | null> {
  const accountId = await externalAccountIdFor(socialBusinessId)
  return accountId ? creditOwnerForAccount(accountId) : null
}
