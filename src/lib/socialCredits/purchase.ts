import Stripe from 'stripe'
import { appBaseUrl, getStripe } from '@/lib/stripe'
import { ensureStripeCustomerForOwner } from '@/lib/domains/stripe-customer'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'
import { fulfilSocialCreditPayment, socialCreditMetadata } from './fulfil'
import { findSavedCard } from './stripeSavedCard'
import type { BillingCurrency } from '@/lib/saas-pricing'
import { socialCreditPackName, type SocialCreditPack } from './packs'

export type PurchaseOwner = {
  id: string
  currency: BillingCurrency
  email: string | undefined
  name: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export type PurchaseResult = { status: 'paid' } | { status: 'pending' } | { status: 'checkout'; url: string }

const description = (pack: SocialCreditPack) => `Vendl Social: ${socialCreditPackName(pack)}`

/** Off-session charge on the saved card. Null when there's no card or it needs the owner (declined / 3DS). */
async function chargeSavedCard(owner: PurchaseOwner, pack: SocialCreditPack, requestId: string) {
  const card = await findSavedCard(owner.stripeCustomerId, owner.stripeSubscriptionId)
  if (!card || !owner.stripeCustomerId) return null
  try {
    const intent = await getStripe().paymentIntents.create(
      {
        amount: pack.prices[owner.currency],
        currency: owner.currency.toLowerCase(),
        customer: owner.stripeCustomerId,
        payment_method: card.paymentMethodId,
        off_session: true,
        confirm: true,
        description: description(pack),
        metadata: socialCreditMetadata(owner.id, pack.id),
      },
      { idempotencyKey: `social-credits:${owner.id}:${requestId}` },
    )
    return intent.status === 'succeeded' || intent.status === 'processing' ? intent : null
  } catch (err) {
    if (err instanceof Stripe.errors.StripeCardError) {
      console.warn('[socialCredits] saved card charge needs the owner', err.code)
      return null
    }
    throw err
  }
}

async function startCheckout(owner: PurchaseOwner, pack: SocialCreditPack): Promise<string> {
  const customerId = await ensureStripeCustomerForOwner({
    ownerId: owner.id,
    existingCustomerId: owner.stripeCustomerId,
    email: owner.email,
    name: owner.name,
  })
  const base = appBaseUrl()
  const metadata = socialCreditMetadata(owner.id, pack.id)
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: owner.currency.toLowerCase(),
          unit_amount: pack.prices[owner.currency],
          product_data: { name: description(pack), description: 'Credits never expire.' },
        },
      },
    ],
    payment_intent_data: { metadata, setup_future_usage: 'off_session' },
    metadata,
    success_url: `${base}${SOCIAL_PATHS.credits}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${SOCIAL_PATHS.credits}?cancelled=1`,
  })
  if (!session.url) throw new Error('Stripe did not return a checkout link')
  return session.url
}

/** One click on the saved card when possible, otherwise Stripe Checkout. */
export async function purchaseSocialCreditPack(
  owner: PurchaseOwner,
  pack: SocialCreditPack,
  requestId: string,
): Promise<PurchaseResult> {
  const intent = await chargeSavedCard(owner, pack, requestId)
  if (intent?.status === 'processing') return { status: 'pending' }
  if (intent) {
    if (await fulfilSocialCreditPayment(intent, owner.id)) return { status: 'paid' }
    throw new Error(`Payment ${intent.id} succeeded but credits were not granted`)
  }
  return { status: 'checkout', url: await startCheckout(owner, pack) }
}

/** Return-from-Checkout: add the credits now rather than waiting for the webhook. */
export async function confirmSocialCreditCheckout(ownerId: string, sessionId: string): Promise<boolean> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] })
  const intent = session.payment_intent
  if (session.metadata?.ownerId !== ownerId || !intent || typeof intent === 'string') return false
  return fulfilSocialCreditPayment(intent, ownerId)
}
