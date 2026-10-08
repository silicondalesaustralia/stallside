/** StitchedUp Trade Library V1 - canonical primary trade slugs (business.primary_trade_slug). */

export const TRADE_DEFINITIONS = [
  { slug: 'plumbing', name: 'Plumbing', sort_order: 1 },
  { slug: 'electrical', name: 'Electrical', sort_order: 2 },
  { slug: 'hvac', name: 'Air Conditioning & HVAC', sort_order: 3 },
  { slug: 'roofing', name: 'Roofing', sort_order: 4 },
  { slug: 'carpentry', name: 'Carpentry', sort_order: 5 },
  { slug: 'painting', name: 'Painting', sort_order: 6 },
  { slug: 'landscaping', name: 'Landscaping', sort_order: 7 },
  { slug: 'concreting', name: 'Concreting', sort_order: 8 },
  { slug: 'tiling', name: 'Tiling', sort_order: 9 },
  { slug: 'plastering', name: 'Plastering & Gyprock', sort_order: 10 },
  { slug: 'pest-control', name: 'Pest Control', sort_order: 11 },
  { slug: 'locksmith', name: 'Locksmith', sort_order: 12 },
  { slug: 'solar', name: 'Solar', sort_order: 13 },
  { slug: 'pool-spa', name: 'Pool & Spa', sort_order: 14 },
  { slug: 'handyman', name: 'Handyman / Property Maintenance', sort_order: 15 },
] as const

export type TradeSlug = (typeof TRADE_DEFINITIONS)[number]['slug']

export const TRADE_SLUGS: TradeSlug[] = TRADE_DEFINITIONS.map((t) => t.slug)

export const TRADE_LABELS: Record<TradeSlug, string> = Object.fromEntries(
  TRADE_DEFINITIONS.map((t) => [t.slug, t.name]),
) as Record<TradeSlug, string>

export function isTradeSlug(value: string): value is TradeSlug {
  return (TRADE_SLUGS as string[]).includes(value)
}

export function formatTradeLabel(slug: string | null | undefined): string {
  if (!slug) return 'Trade'
  if (isTradeSlug(slug)) return TRADE_LABELS[slug]
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
}

/** Map primary trade slug → legacy canonical trade id for social/AI imagery. */
export const TRADE_SLUG_TO_CANONICAL: Partial<Record<TradeSlug, string>> = {
  plumbing: 'plumber',
  electrical: 'electrician',
  hvac: 'air_conditioning_hvac',
  roofing: 'roofer',
  carpentry: 'carpenter',
  painting: 'painter',
  landscaping: 'landscaper',
  concreting: 'concreter',
  tiling: 'tiler',
  plastering: 'builder_general_contractor',
  'pest-control': 'pest_control',
  locksmith: 'locksmith',
  solar: 'solar_installer',
  'pool-spa': 'pool_builder_maintenance',
  handyman: 'handyman',
}

/** Map fine-grained canonical trade ids back to primary trade slug. */
export const CANONICAL_TO_TRADE_SLUG: Record<string, TradeSlug> = {
  ...Object.fromEntries(
    Object.entries(TRADE_SLUG_TO_CANONICAL).map(([slug, canonical]) => [canonical, slug]),
  ),
  drain_sewer_specialist: 'plumbing',
  hot_water_system: 'plumbing',
  heating_cooling_technician: 'hvac',
  builder_general_contractor: 'carpentry',
  gardener_lawn_care: 'landscaping',
  bricklayer_mason: 'concreting',
  flooring_installer: 'tiling',
  pool_builder_maintenance: 'pool-spa',
  solar_installer: 'solar',
}

export function canonicalTradeToSlug(canonicalId: string): TradeSlug | null {
  const slug = CANONICAL_TO_TRADE_SLUG[canonicalId]
  return slug && isTradeSlug(slug) ? slug : null
}
