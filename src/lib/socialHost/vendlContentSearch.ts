import { prisma } from '@/lib/prisma'
import { formatMoney } from '@/lib/money'
import type { VendlContentItem } from '@/lib/socialHost/vendlContentTypes'

const PER_KIND = 12

const INTERVAL_LABEL: Record<string, string> = {
  WEEKLY: 'weekly',
  FORTNIGHTLY: 'fortnightly',
  MONTHLY: 'monthly',
}

function shortDate(d: Date, timeZone: string): string {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone })
}

/** Products, pre-order pages, subscriptions and memberships for one stand. */
export async function searchVendlContent(standId: string, query: string): Promise<VendlContentItem[]> {
  const q = query.trim().slice(0, 80)
  const titleFilter = q ? { contains: q, mode: 'insensitive' as const } : undefined

  const [stand, products, preOrders, offers] = await Promise.all([
    prisma.stand.findUnique({ where: { id: standId }, select: { timezone: true } }),
    prisma.product.findMany({
      where: { standId, isArchived: false, isHidden: false, ...(titleFilter ? { name: titleFilter } : {}) },
      select: { id: true, name: true, imageUrl: true, priceCents: true, currency: true },
      orderBy: { updatedAt: 'desc' },
      take: PER_KIND,
    }),
    prisma.preOrderPage.findMany({
      where: { standId, ...(titleFilter ? { title: titleFilter } : {}) },
      select: { id: true, title: true, imageUrl: true, collectionAt: true, isActive: true },
      orderBy: { collectionAt: 'desc' },
      take: PER_KIND,
    }),
    prisma.subscriptionOffer.findMany({
      where: { standId, ...(titleFilter ? { title: titleFilter } : {}) },
      select: { id: true, title: true, imageUrl: true, kind: true, interval: true, isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: PER_KIND,
    }),
  ])
  const timeZone = stand?.timezone ?? 'Australia/Adelaide'

  return [
    ...products.map((p) => ({
      ref: `product:${p.id}`,
      kind: 'product' as const,
      title: p.name,
      subtitle: formatMoney(p.priceCents, p.currency),
      imageUrl: p.imageUrl,
    })),
    ...preOrders.map((p) => ({
      ref: `preorder:${p.id}`,
      kind: 'preorder' as const,
      title: p.title,
      subtitle: `Collect ${shortDate(p.collectionAt, timeZone)}${p.isActive ? '' : ' · inactive'}`,
      imageUrl: p.imageUrl,
    })),
    ...offers.map((o) => ({
      ref: `offer:${o.id}`,
      kind: o.kind === 'MEMBERSHIP' ? ('membership' as const) : ('subscription' as const),
      title: o.title,
      subtitle: `${o.kind === 'MEMBERSHIP' ? 'Membership' : `Box · ${INTERVAL_LABEL[o.interval] ?? ''}`}${o.isActive ? '' : ' · inactive'}`,
      imageUrl: o.imageUrl,
    })),
  ]
}
