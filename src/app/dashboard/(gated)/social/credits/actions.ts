'use server'

import { revalidatePath } from 'next/cache'
import { requireOwner } from '@/lib/session'
import { socialKitEnabledFor } from '@/lib/beta-features'
import { SOCIAL_BASE_PATH } from '@/lib/socialHost/hostConfig'
import { findSocialCreditPack } from '@/lib/socialCredits/packs'
import {
  confirmSocialCreditCheckout,
  purchaseSocialCreditPack,
  type PurchaseResult,
} from '@/lib/socialCredits/purchase'

export type BuyPackResult = PurchaseResult | { status: 'error'; error: string }

const REQUEST_ID_RE = /^[a-zA-Z0-9-]{8,64}$/

export async function buySocialCreditPack(packId: string, requestId: string): Promise<BuyPackResult> {
  const { owner, user, impersonator } = await requireOwner()
  if (impersonator) return { status: 'error', error: "Purchases are disabled while you're impersonating an owner." }
  if (!socialKitEnabledFor(owner, user.email)) return { status: 'error', error: 'Social is not available on your account yet.' }
  const pack = findSocialCreditPack(packId)
  if (!pack) return { status: 'error', error: 'That pack is not available.' }
  if (!REQUEST_ID_RE.test(requestId)) return { status: 'error', error: 'Invalid request - refresh and try again.' }

  try {
    const result = await purchaseSocialCreditPack(
      {
        id: owner.id,
        email: user.email ?? owner.contactEmail ?? undefined,
        name: owner.businessName,
        stripeCustomerId: owner.stripeCustomerId,
        stripeSubscriptionId: owner.stripeSubscriptionId,
      },
      pack,
      requestId,
    )
    if (result.status === 'paid') revalidatePath(SOCIAL_BASE_PATH, 'layout')
    return result
  } catch (err) {
    console.error('[socialCredits] purchase failed', { ownerId: owner.id, packId, err })
    return { status: 'error', error: 'Payment could not be started. Please try again.' }
  }
}

export async function confirmSocialCreditPurchase(sessionId: string): Promise<{ ok: boolean }> {
  const { owner } = await requireOwner()
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) return { ok: false }
  try {
    const ok = await confirmSocialCreditCheckout(owner.id, sessionId)
    if (ok) revalidatePath(SOCIAL_BASE_PATH, 'layout')
    return { ok }
  } catch (err) {
    console.error('[socialCredits] checkout confirm failed', { ownerId: owner.id, err })
    return { ok: false }
  }
}
