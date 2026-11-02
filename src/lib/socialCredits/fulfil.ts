import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { socialDb } from '@/lib/socialHost/socialDb'
import { grantSocialCreditPack } from './ledger'
import { findSocialCreditPack } from './packs'

export const SOCIAL_CREDITS_PURPOSE = 'social_credits'

export type SocialCreditMetadata = { purpose: string; ownerId: string; packId: string }

export function socialCreditMetadata(ownerId: string, packId: string): SocialCreditMetadata {
  return { purpose: SOCIAL_CREDITS_PURPOSE, ownerId, packId }
}

/** Adds the pack for a succeeded PaymentIntent. Safe to call from both the webhook and the return page. */
export async function fulfilSocialCreditPayment(
  intent: Stripe.PaymentIntent,
  expectedOwnerId?: string,
): Promise<boolean> {
  const meta = intent.metadata ?? {}
  if (meta.purpose !== SOCIAL_CREDITS_PURPOSE || intent.status !== 'succeeded') return false
  const pack = findSocialCreditPack(meta.packId)
  const ownerId = meta.ownerId?.trim()
  if (!pack || !ownerId) {
    console.error('[socialCredits] payment missing pack/owner metadata', intent.id)
    return false
  }
  if (expectedOwnerId && expectedOwnerId !== ownerId) return false
  if (intent.amount_received < pack.priceCents) {
    console.error('[socialCredits] payment amount below pack price', { id: intent.id, amount: intent.amount_received })
    return false
  }
  await grantSocialCreditPack(socialDb(), {
    ownerId,
    pack,
    paymentIntentId: intent.id,
    amountCents: intent.amount_received,
    currency: intent.currency,
  })
  return true
}

/** Platform webhook events for credit packs. True when the event was a credit purchase. */
export async function handleSocialCreditWebhook(event: Stripe.Event): Promise<boolean> {
  if (event.account) return false
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    if (intent.metadata?.purpose !== SOCIAL_CREDITS_PURPOSE) return false
    await fulfilSocialCreditPayment(intent)
    return true
  }
  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return false
  }
  const session = event.data.object
  if (session.metadata?.purpose !== SOCIAL_CREDITS_PURPOSE) return false
  const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  if (intentId && session.payment_status === 'paid') {
    await fulfilSocialCreditPayment(await getStripe().paymentIntents.retrieve(intentId))
  }
  return true
}
