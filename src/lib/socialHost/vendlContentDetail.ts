import { prisma } from '@/lib/prisma'
import { formatMoney } from '@/lib/money'
import type { VendlContentKind, VendlContentRef } from '@/lib/socialHost/vendlContentTypes'

export type VendlContentDetail = {
  kind: VendlContentKind
  title: string
  description: string | null
  /** Plain facts for the caption/image AI (price, dates, what's included). */
  notes: string
  imageUrls: string[]
}

function longDate(d: Date, timeZone: string): string {
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone })
}

function uniqueUrls(urls: (string | null | undefined)[]): string[] {
  return [...new Set(urls.filter((u): u is string => Boolean(u?.trim())))].slice(0, 6)
}

/** Loads one item, scoped to the stand so a ref from another business is never read. */
export async function loadVendlContentDetail(
  standId: string,
  ref: VendlContentRef,
): Promise<VendlContentDetail | null> {
  const stand = await prisma.stand.findUnique({ where: { id: standId }, select: { timezone: true } })
  const timeZone = stand?.timezone ?? 'Australia/Adelaide'

  if (ref.source === 'product') {
    const p = await prisma.product.findFirst({
      where: { id: ref.id, standId },
      select: { name: true, description: true, imageUrl: true, priceCents: true, currency: true, freshnessNote: true },
    })
    if (!p) return null
    const notes = [`Product: ${p.name}`, `Price: ${formatMoney(p.priceCents, p.currency)}`, p.freshnessNote]
    return {
      kind: 'product',
      title: p.name,
      description: p.description,
      notes: notes.filter(Boolean).join('. '),
      imageUrls: uniqueUrls([p.imageUrl]),
    }
  }

  if (ref.source === 'preorder') {
    const page = await prisma.preOrderPage.findFirst({
      where: { id: ref.id, standId },
      select: {
        title: true, description: true, imageUrl: true, orderByAt: true, collectionAt: true, collectionNote: true,
        items: { orderBy: { sortOrder: 'asc' }, select: { product: { select: { name: true, imageUrl: true } } } },
      },
    })
    if (!page) return null
    const names = page.items.map((i) => i.product.name)
    const notes = [
      `Pre-order: ${page.title}`,
      `Order by ${longDate(page.orderByAt, timeZone)}`,
      `Collect ${longDate(page.collectionAt, timeZone)}`,
      page.collectionNote,
      names.length ? `Includes: ${names.join(', ')}` : null,
    ]
    return {
      kind: 'preorder',
      title: page.title,
      description: page.description,
      notes: notes.filter(Boolean).join('. '),
      imageUrls: uniqueUrls([page.imageUrl, ...page.items.map((i) => i.product.imageUrl)]),
    }
  }

  const offer = await prisma.subscriptionOffer.findFirst({
    where: { id: ref.id, standId },
    select: {
      title: true, description: true, imageUrl: true, kind: true, interval: true, priceCents: true, currency: true,
      termWeeks: true, collectionNote: true,
      items: { orderBy: { sortOrder: 'asc' }, select: { quantity: true, product: { select: { name: true, imageUrl: true } } } },
    },
  })
  if (!offer) return null
  const isMembership = offer.kind === 'MEMBERSHIP'
  const names = offer.items.map((i) => (i.quantity > 1 ? `${i.quantity} × ${i.product.name}` : i.product.name))
  const notes = [
    `${isMembership ? 'Membership' : 'Subscription box'}: ${offer.title}`,
    isMembership && offer.termWeeks ? `${offer.termWeeks}-week term` : `${offer.interval.toLowerCase()} delivery or collection`,
    `From ${formatMoney(offer.priceCents, offer.currency)}`,
    offer.collectionNote,
    names.length ? `Includes: ${names.join(', ')}` : null,
  ]
  return {
    kind: isMembership ? 'membership' : 'subscription',
    title: offer.title,
    description: offer.description,
    notes: notes.filter(Boolean).join('. '),
    imageUrls: uniqueUrls([offer.imageUrl, ...offer.items.map((i) => i.product.imageUrl)]),
  }
}
