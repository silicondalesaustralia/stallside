import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'

export type SavedCard = { paymentMethodId: string; brand: string; last4: string }

function cardFrom(pm: Stripe.PaymentMethod | string | null | undefined): SavedCard | null {
  if (!pm || typeof pm === 'string' || !pm.card) return null
  return { paymentMethodId: pm.id, brand: pm.card.brand, last4: pm.card.last4 }
}

/** The card on the owner's Vendl subscription (or their customer default), if any. */
export async function findSavedCard(
  customerId: string | null,
  subscriptionId: string | null,
): Promise<SavedCard | null> {
  if (!customerId) return null
  const stripe = getStripe()
  try {
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['default_payment_method'] })
      const card = cardFrom(sub.default_payment_method)
      if (card) return card
    }
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method'],
    })
    if (!('deleted' in customer && customer.deleted)) {
      const card = cardFrom((customer as Stripe.Customer).invoice_settings?.default_payment_method)
      if (card) return card
    }
    const list = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 })
    return cardFrom(list.data[0])
  } catch (err) {
    console.warn('[socialCredits] saved card lookup failed', err instanceof Error ? err.message : err)
    return null
  }
}
