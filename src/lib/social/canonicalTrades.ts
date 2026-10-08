import { isTradeSlug, TRADE_SLUG_TO_CANONICAL } from '@/lib/trades/taxonomy'

/**
 * Canonical trade set for StitchedUp social / AI imagery.
 * Locked product list - extend only with an explicit product decision.
 *
 * Note: the product brief said "29 trades" but listed 30 names; all 30 are locked.
 */

export const CANONICAL_TRADES = [
  { id: 'plumber',                     label: 'Plumber' },
  { id: 'electrician',                 label: 'Electrician' },
  { id: 'air_conditioning_hvac',       label: 'Air Conditioning/HVAC' },
  { id: 'heating_cooling_technician',  label: 'Heating & Cooling Technician' },
  { id: 'roofer',                      label: 'Roofer' },
  { id: 'carpenter',                   label: 'Carpenter' },
  { id: 'builder_general_contractor',  label: 'Builder/General Contractor' },
  { id: 'handyman',                    label: 'Handyman' },
  { id: 'painter',                     label: 'Painter' },
  { id: 'landscaper',                  label: 'Landscaper' },
  { id: 'gardener_lawn_care',          label: 'Gardener/Lawn Care' },
  { id: 'arborist_tree_removal',       label: 'Arborist/Tree Removal' },
  { id: 'pest_control',                label: 'Pest Control' },
  { id: 'locksmith',                   label: 'Locksmith' },
  { id: 'garage_door',                 label: 'Garage Door Installer & Repair' },
  { id: 'glazier_glass_repair',        label: 'Glazier/Glass Repair' },
  { id: 'tiler',                       label: 'Tiler' },
  { id: 'flooring_installer',          label: 'Flooring Installer' },
  { id: 'concreter',                   label: 'Concreter' },
  { id: 'bricklayer_mason',            label: 'Bricklayer/Mason' },
  { id: 'fencing_contractor',          label: 'Fencing Contractor' },
  { id: 'deck_patio_builder',          label: 'Deck & Patio Builder' },
  { id: 'pool_builder_maintenance',    label: 'Pool Builder & Maintenance' },
  { id: 'solar_installer',             label: 'Solar Installer' },
  { id: 'hot_water_system',            label: 'Hot Water System Installer/Repair' },
  { id: 'drain_sewer_specialist',      label: 'Drain & Sewer Specialist' },
  { id: 'gutter_installation_cleaning',label: 'Gutter Installation & Cleaning' },
  { id: 'pressure_washing',            label: 'Pressure Washing/Exterior Cleaning' },
  { id: 'carpet_upholstery_cleaning',  label: 'Carpet & Upholstery Cleaning' },
  { id: 'house_cleaning',              label: 'House Cleaning' },
] as const

export type CanonicalTradeId = (typeof CANONICAL_TRADES)[number]['id']

export const CANONICAL_TRADE_IDS: CanonicalTradeId[] = CANONICAL_TRADES.map((t) => t.id)

export const CANONICAL_TRADE_LABELS: Record<CanonicalTradeId, string> = Object.fromEntries(
  CANONICAL_TRADES.map((t) => [t.id, t.label]),
) as Record<CanonicalTradeId, string>

/** Coarse buckets used by legacy Orshot style-template tabs. */
export type StyleTradeBucket =
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'construction'
  | 'home_service'
  | 'pest_control'
  | 'cleaning'
  | 'contractor'
  | 'general'

export const CANONICAL_TO_STYLE_BUCKET: Record<CanonicalTradeId, StyleTradeBucket> = {
  plumber:                      'plumbing',
  electrician:                  'electrical',
  air_conditioning_hvac:        'hvac',
  heating_cooling_technician:   'hvac',
  roofer:                       'construction',
  carpenter:                    'construction',
  builder_general_contractor:   'construction',
  handyman:                     'home_service',
  painter:                      'home_service',
  landscaper:                   'home_service',
  gardener_lawn_care:           'home_service',
  arborist_tree_removal:        'home_service',
  pest_control:                 'pest_control',
  locksmith:                    'home_service',
  garage_door:                  'home_service',
  glazier_glass_repair:         'construction',
  tiler:                        'construction',
  flooring_installer:           'construction',
  concreter:                    'construction',
  bricklayer_mason:             'construction',
  fencing_contractor:           'construction',
  deck_patio_builder:           'construction',
  pool_builder_maintenance:     'home_service',
  solar_installer:              'electrical',
  hot_water_system:             'plumbing',
  drain_sewer_specialist:       'plumbing',
  gutter_installation_cleaning: 'construction',
  pressure_washing:             'cleaning',
  carpet_upholstery_cleaning:   'cleaning',
  house_cleaning:               'cleaning',
}

/**
 * Keyword matchers - order matters (more specific trades first).
 * Matched against lowercase `ai_agent_services` + business `name`.
 */
export const CANONICAL_TRADE_KEYWORDS: { id: CanonicalTradeId; keywords: string[] }[] = [
  { id: 'drain_sewer_specialist',       keywords: ['drain', 'sewer', 'blocked drain', 'drain cleaning', 'cctv drain'] },
  { id: 'hot_water_system',             keywords: ['hot water', 'hotwater', 'water heater', 'hotsy', 'rheem', 'aquamax'] },
  { id: 'air_conditioning_hvac',        keywords: ['air conditioning', 'airconditioning', 'aircon', 'a/c ', ' hvac', 'split system', 'ducted air'] },
  { id: 'heating_cooling_technician',   keywords: ['heating and cooling', 'heating & cooling', 'heat pump', 'furnace', 'boiler service'] },
  { id: 'carpet_upholstery_cleaning',   keywords: ['carpet clean', 'upholstery clean', 'rug clean', 'steam clean carpet'] },
  { id: 'house_cleaning',               keywords: ['house clean', 'home clean', 'domestic clean', 'end of lease clean', 'bond clean', 'cleaner'] },
  { id: 'pressure_washing',             keywords: ['pressure wash', 'high pressure clean', 'soft wash', 'exterior clean', 'concrete clean'] },
  { id: 'gutter_installation_cleaning', keywords: ['gutter', 'downpipe', 'fascia gutter'] },
  { id: 'pool_builder_maintenance',     keywords: ['pool build', 'pool maintenance', 'swimming pool', 'pool clean', 'pool service'] },
  { id: 'solar_installer',              keywords: ['solar', 'pv panel', 'solar panel', 'solar install'] },
  { id: 'garage_door',                  keywords: ['garage door', 'roller door', 'sectional door'] },
  { id: 'glazier_glass_repair',         keywords: ['glazier', 'glass repair', 'window glass', 'shower screen', 'glass replacement'] },
  { id: 'arborist_tree_removal',        keywords: ['arborist', 'tree removal', 'tree lopping', 'tree cutting', 'stump grind'] },
  { id: 'gardener_lawn_care',           keywords: ['lawn care', 'lawn mow', 'gardener', 'garden maintenance', 'turf'] },
  { id: 'landscaper',                   keywords: ['landscap', 'landscape design', 'hardscape'] },
  { id: 'deck_patio_builder',           keywords: ['deck builder', 'decking', 'patio builder', 'outdoor deck'] },
  { id: 'fencing_contractor',           keywords: ['fencing', 'fence install', 'fence repair', 'colorbond fence'] },
  { id: 'bricklayer_mason',             keywords: ['bricklay', 'brickie', 'masonry', 'blockwork', 'stone mason'] },
  { id: 'concreter',                    keywords: ['concreter', 'concrete pour', 'concret', 'slab pour', 'exposed aggregate'] },
  { id: 'flooring_installer',           keywords: ['flooring', 'floor install', 'vinyl plank', 'laminate floor', 'timber floor', 'carpet lay'] },
  { id: 'tiler',                        keywords: ['tiler', 'tiling', 'tile install', 'bathroom tile'] },
  { id: 'pest_control',                 keywords: ['pest control', 'termite', 'cockroach', 'rodent', 'vermin'] },
  { id: 'locksmith',                    keywords: ['locksmith', 'lock change', 'rekey', 'locked out'] },
  { id: 'painter',                      keywords: ['painter', 'painting', 'house paint', 'interior paint'] },
  { id: 'handyman',                     keywords: ['handyman', 'odd jobs', 'maintenance man'] },
  { id: 'carpenter',                    keywords: ['carpenter', 'carpentry', 'joinery', 'cabinet'] },
  { id: 'roofer',                       keywords: ['roofer', 'roofing', 'roof repair', 'roof restore', 'colorbond roof'] },
  { id: 'builder_general_contractor',   keywords: ['builder', 'building company', 'general contractor', 'renovation builder', 'construction company'] },
  { id: 'electrician',                  keywords: ['electrician', 'electrical', 'switchboard', 'ev charger', 'wiring', 'power point'] },
  { id: 'plumber',                      keywords: ['plumber', 'plumbing', 'tapware', 'toilet repair', 'gas fitting'] },
]

export function isCanonicalTradeId(value: string): value is CanonicalTradeId {
  return (CANONICAL_TRADE_IDS as string[]).includes(value)
}

export function formatCanonicalTradeLabel(id: string): string {
  if (isCanonicalTradeId(id)) return CANONICAL_TRADE_LABELS[id]
  return id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ')
}

/**
 * Infer fine-grained canonical trade from business text.
 * Returns null if nothing matches.
 */
export function inferCanonicalTrade(input: {
  primary_trade_slug?: string | null
  ai_agent_services?: string | null
  name?: string | null
}): CanonicalTradeId | null {
  if (input.primary_trade_slug && isTradeSlug(input.primary_trade_slug)) {
    const mapped = TRADE_SLUG_TO_CANONICAL[input.primary_trade_slug]
    if (mapped && isCanonicalTradeId(mapped)) return mapped
  }

  const text = `${input.ai_agent_services || ''} ${input.name || ''}`.toLowerCase()
  if (!text.trim()) return null

  for (const { id, keywords } of CANONICAL_TRADE_KEYWORDS) {
    if (keywords.some((kw) => text.includes(kw))) return id
  }
  return null
}

export function canonicalToStyleBucket(id: CanonicalTradeId): StyleTradeBucket {
  return CANONICAL_TO_STYLE_BUCKET[id]
}
