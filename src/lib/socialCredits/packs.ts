import { isBillingCurrency, type BillingCurrency } from '../saas-pricing'

export type SocialCreditKind = 'design' | 'clip'

export const SOCIAL_CREDIT_KINDS: readonly SocialCreditKind[] = ['design', 'clip']

/** Included each month on Pro; resets monthly. Bought packs never expire. */
export const PRO_MONTHLY_ALLOWANCE: Record<SocialCreditKind, number> = { design: 5, clip: 5 }

export type SocialCreditPack = {
  id: string
  kind: SocialCreditKind
  credits: number
  /** Fixed list prices in cents, matching the owner's Vendl billing currency. */
  prices: Record<BillingCurrency, number>
}

const price = (AUD: number, USD: number, GBP: number, EUR: number) => ({ AUD, USD, GBP, EUR })

export const SOCIAL_CREDIT_PACKS: readonly SocialCreditPack[] = [
  { id: 'design_10', kind: 'design', credits: 10, prices: price(2500, 1900, 1500, 1900) },
  { id: 'design_25', kind: 'design', credits: 25, prices: price(5500, 4200, 3300, 4200) },
  { id: 'design_50', kind: 'design', credits: 50, prices: price(9900, 7500, 5900, 7500) },
  { id: 'clip_5', kind: 'clip', credits: 5, prices: price(900, 700, 500, 700) },
  { id: 'clip_15', kind: 'clip', credits: 15, prices: price(1900, 1400, 1100, 1400) },
  { id: 'clip_30', kind: 'clip', credits: 30, prices: price(2900, 2200, 1700, 2200) },
]

/** Owner's billing currency, falling back to AUD. */
export function creditCurrency(value: string | null | undefined): BillingCurrency {
  const code = (value ?? '').trim().toUpperCase()
  return isBillingCurrency(code) ? code : 'AUD'
}

export const SOCIAL_CREDIT_LABELS: Record<SocialCreditKind, { one: string; many: string; title: string }> = {
  design: { one: 'design', many: 'designs', title: 'AI designs & images' },
  clip: { one: 'clip', many: 'clips', title: 'Video clips' },
}

export function findSocialCreditPack(id: unknown): SocialCreditPack | null {
  return SOCIAL_CREDIT_PACKS.find((p) => p.id === id) ?? null
}

export function socialCreditPackName(pack: SocialCreditPack): string {
  const label = SOCIAL_CREDIT_LABELS[pack.kind]
  return `${pack.credits} ${pack.credits === 1 ? label.one : label.many}`
}

const SYMBOLS: Record<BillingCurrency, string> = { AUD: 'A$', USD: 'US$', GBP: '£', EUR: '€' }

export function formatPackPrice(pack: SocialCreditPack, currency: BillingCurrency): string {
  const cents = pack.prices[currency]
  return `${SYMBOLS[currency]}${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

/** Allowance month, in Adelaide time (YYYY-MM). */
export function socialCreditPeriodKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Adelaide',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value ?? String(now.getUTCFullYear())
  const month = parts.find((p) => p.type === 'month')?.value ?? String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
