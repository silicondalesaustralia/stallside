import { prisma } from '@/lib/prisma'

/** Vendl facts the social AI needs about a stand (mirrored onto the social business). */
export type HostBusinessProfile = {
  businessType: string
  /** Seeds businesses.ai_agent_services ("what we sell") for planner/image prompts. */
  servicesSummary: string
  suburb: string | null
  state: string | null
  phone: string | null
}

export const DEFAULT_BUSINESS_TYPE = 'local producer'

const SUMMARY_PRODUCTS = 8

const VERTICAL_TYPE: Record<string, string> = {
  bakers: 'home bakery',
  'farm-stalls': 'farm stall',
  firewood: 'firewood supplier',
}

const MODE_TYPE: Record<string, string> = {
  FARM_STAND: 'farm stall',
  FOOD_BUSINESS: 'home food business',
  BOTH: 'farm stall and food business',
}

export function businessTypeFor(verticalSlug: string | null, businessMode: string | null): string {
  return (
    (verticalSlug && VERTICAL_TYPE[verticalSlug]) ||
    (businessMode && MODE_TYPE[businessMode]) ||
    DEFAULT_BUSINESS_TYPE
  )
}

export async function loadHostBusinessProfile(standId: string): Promise<HostBusinessProfile> {
  const [stand, products] = await Promise.all([
    prisma.stand.findUnique({
      where: { id: standId },
      select: {
        verticalSlug: true,
        locationLabel: true,
        owner: { select: { businessMode: true, stateTerritory: true, contactPhone: true } },
      },
    }),
    prisma.product.findMany({
      where: { standId, isArchived: false, isHidden: false },
      select: { name: true },
      orderBy: { updatedAt: 'desc' },
      take: SUMMARY_PRODUCTS,
    }),
  ])
  const businessType = businessTypeFor(stand?.verticalSlug ?? null, stand?.owner.businessMode ?? null)
  const names = products.map((p) => p.name.trim()).filter(Boolean)
  return {
    businessType,
    servicesSummary: names.length ? `${businessType} selling ${names.join(', ')}` : businessType,
    suburb: stand?.locationLabel?.trim() || null,
    state: stand?.owner.stateTerritory?.trim() || null,
    phone: stand?.owner.contactPhone?.trim() || null,
  }
}