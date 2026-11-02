export type SocialCreditKind = 'design' | 'clip'

export const SOCIAL_CREDIT_KINDS: readonly SocialCreditKind[] = ['design', 'clip']

/** Included each month on Pro; resets monthly. Bought packs never expire. */
export const PRO_MONTHLY_ALLOWANCE: Record<SocialCreditKind, number> = { design: 5, clip: 5 }

export const SOCIAL_CREDIT_CURRENCY = 'aud'

export type SocialCreditPack = {
  id: string
  kind: SocialCreditKind
  credits: number
  priceCents: number
}

export const SOCIAL_CREDIT_PACKS: readonly SocialCreditPack[] = [
  { id: 'design_10', kind: 'design', credits: 10, priceCents: 2500 },
  { id: 'design_25', kind: 'design', credits: 25, priceCents: 5500 },
  { id: 'design_50', kind: 'design', credits: 50, priceCents: 9900 },
  { id: 'clip_5', kind: 'clip', credits: 5, priceCents: 900 },
  { id: 'clip_15', kind: 'clip', credits: 15, priceCents: 1900 },
  { id: 'clip_30', kind: 'clip', credits: 30, priceCents: 2900 },
]

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

export function formatAud(cents: number): string {
  return `A$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
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
