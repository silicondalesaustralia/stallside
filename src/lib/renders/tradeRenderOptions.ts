import { inferCanonicalTrade, type CanonicalTradeId } from '@/lib/social/canonicalTrades'

/** Coarse trade buckets for Before & After change options. */
export const RENDER_TRADE_IDS = [
  'plumbing',
  'hvac',
  'electrical',
  'painting',
  'carpentry',
  'roofing',
  'landscaping',
  'building',
  'general',
] as const

export type RenderTradeId = (typeof RENDER_TRADE_IDS)[number]

export const CUSTOM_RENDER_CHANGE_ID = 'other_custom'

export interface RenderChangeOption {
  id: string
  label: string
  promptFragment: string
}

export const RENDER_TRADE_LABELS: Record<RenderTradeId, string> = {
  plumbing: 'Plumbing',
  hvac: 'HVAC',
  electrical: 'Electrical',
  painting: 'Painting',
  carpentry: 'Carpentry / Joinery',
  roofing: 'Roofing',
  landscaping: 'Landscaping',
  building: 'Builder / Renovation',
  general: 'General',
}

/** Legacy renovation keys - kept for existing renders + builder trade. */
export const LEGACY_BUILDER_CHANGE_OPTIONS: RenderChangeOption[] = [
  { id: 'paint_walls', label: 'Paint / Walls', promptFragment: 'refresh wall paint with an updated colour palette suited to the chosen style' },
  { id: 'flooring', label: 'Flooring', promptFragment: 'replace flooring with new materials that suit the chosen style' },
  { id: 'cabinets_fixtures', label: 'Cabinets / Fixtures', promptFragment: 'update cabinets, benchtops, and fixtures to match the renovation' },
  { id: 'lighting', label: 'Lighting', promptFragment: 'improve lighting fixtures and overall lighting quality in the space' },
  { id: 'full_renovation', label: 'Full Renovation', promptFragment: 'complete a full room renovation while preserving the space identity' },
]

const CUSTOM_CHANGE_OPTION: RenderChangeOption = {
  id: CUSTOM_RENDER_CHANGE_ID,
  label: 'Other / describe changes',
  promptFragment: '',
}

export const TRADE_RENDER_CHANGES: Record<RenderTradeId, RenderChangeOption[]> = {
  plumbing: [
    { id: 'bathroom_renovation', label: 'Bathroom renovation', promptFragment: 'upgrade the bathroom with modern fixtures and a cleaner finished look while keeping the same layout' },
    { id: 'hot_water_replacement', label: 'Hot water system replacement', promptFragment: 'replace the old hot water system with a modern unit and tidy surrounding pipework' },
    { id: 'tapware_fixtures', label: 'Tapware / fixtures', promptFragment: 'update tapware and plumbing fixtures to a modern, polished finish' },
    { id: 'vanity_cabinetry', label: 'Vanity / cabinetry', promptFragment: 'install or refresh vanity and bathroom cabinetry with a clean professional finish' },
    { id: 'pipework_tidy', label: 'Pipework tidy-up', promptFragment: 'neaten and professionalise exposed pipework with a clean installation finish' },
    { id: 'clean_install_finish', label: 'Clean installation finish', promptFragment: 'show a spotless, professional plumbing installation with tidy workmanship' },
    { id: 'full_bathroom_makeover', label: 'Full bathroom makeover', promptFragment: 'complete a full bathroom makeover while preserving room structure and camera angle' },
    CUSTOM_CHANGE_OPTION,
  ],
  hvac: [
    { id: 'indoor_unit_replacement', label: 'Indoor unit replacement', promptFragment: 'replace the indoor HVAC unit with a modern split-system head unit in the same location' },
    { id: 'outdoor_unit_replacement', label: 'Outdoor unit replacement', promptFragment: 'replace the outdoor condenser unit with a modern unit on the same pad or wall bracket' },
    { id: 'duct_vent_upgrade', label: 'Duct / vent upgrade', promptFragment: 'upgrade ducting and supply vents for a cleaner, more modern HVAC installation' },
    { id: 'clean_install_finish', label: 'Clean installation finish', promptFragment: 'show a neat, professional HVAC installation with tidy lines and clear equipment placement' },
    { id: 'plant_room_upgrade', label: 'Plant-room upgrade', promptFragment: 'modernise plant-room or mechanical equipment layout with organised, professional finishes' },
    { id: 'system_replacement', label: 'System replacement', promptFragment: 'replace the existing HVAC system with modern equipment while keeping the same site context' },
    { id: 'full_hvac_upgrade', label: 'Full HVAC upgrade', promptFragment: 'show a complete HVAC upgrade with updated indoor and outdoor equipment' },
    CUSTOM_CHANGE_OPTION,
  ],
  electrical: [
    { id: 'lighting_upgrade', label: 'Lighting upgrade', promptFragment: 'upgrade lighting fixtures and overall lighting quality for a modern finished look' },
    { id: 'switchboard_replacement', label: 'Switchboard replacement', promptFragment: 'replace the switchboard with a modern compliant board and tidy surrounding area' },
    { id: 'powerpoint_switch_upgrade', label: 'Powerpoint / switch upgrade', promptFragment: 'update powerpoints and switches to modern plates with a clean installation finish' },
    { id: 'ev_charger_installation', label: 'EV charger installation', promptFragment: 'add a wall-mounted EV charger with neat cable management and professional install finish' },
    { id: 'ceiling_fan_installation', label: 'Ceiling fan installation', promptFragment: 'install a ceiling fan with balanced, clean mounting and updated ceiling presentation' },
    { id: 'clean_install_finish', label: 'Clean installation finish', promptFragment: 'show spotless electrical workmanship with tidy cabling and professional finishes' },
    { id: 'full_electrical_upgrade', label: 'Full electrical upgrade', promptFragment: 'show a comprehensive electrical upgrade with modern fixtures and tidy installation' },
    CUSTOM_CHANGE_OPTION,
  ],
  painting: [
    { id: 'walls_ceilings', label: 'Walls / ceilings', promptFragment: 'refresh walls and ceilings with a clean, even professional paint finish' },
    { id: 'exterior_repaint', label: 'Exterior repaint', promptFragment: 'repaint the exterior surfaces with a fresh, uniform professional finish' },
    { id: 'feature_wall', label: 'Feature wall', promptFragment: 'add or refresh a feature wall with bold, clean paint work' },
    { id: 'trim_doors', label: 'Trim / doors', promptFragment: 'repaint trim, architraves, and doors with crisp professional edges' },
    { id: 'colour_change', label: 'Colour change', promptFragment: 'apply a cohesive new colour scheme with professional coverage' },
    { id: 'full_repaint', label: 'Full repaint', promptFragment: 'complete a full repaint of the visible surfaces with a polished result' },
    CUSTOM_CHANGE_OPTION,
  ],
  carpentry: [
    { id: 'cabinets', label: 'Cabinets', promptFragment: 'install or refresh cabinetry with precise joinery and a professional finish' },
    { id: 'shelving', label: 'Shelving', promptFragment: 'add or upgrade built-in shelving with clean lines and quality timber work' },
    { id: 'doors', label: 'Doors', promptFragment: 'install or replace doors with accurate fit and quality hardware' },
    { id: 'trim', label: 'Trim', promptFragment: 'install or refresh skirting, architraves, and trim with crisp detail' },
    { id: 'timber_feature', label: 'Timber feature', promptFragment: 'add a timber feature element with warm, professional craftsmanship' },
    { id: 'full_renovation', label: 'Full renovation', promptFragment: 'complete a joinery-focused renovation while preserving room identity' },
    CUSTOM_CHANGE_OPTION,
  ],
  roofing: [
    { id: 'roof_replacement', label: 'Roof replacement', promptFragment: 'replace the roof covering with new materials while keeping the same roof form' },
    { id: 'roof_restoration', label: 'Roof restoration', promptFragment: 'restore the roof to a clean, renewed appearance with professional finish' },
    { id: 'gutter_replacement', label: 'Gutter replacement', promptFragment: 'replace gutters and downpipes with neat, aligned installation' },
    { id: 'fascia_flashing', label: 'Fascia / flashing', promptFragment: 'refresh fascia, flashing, and edge details for a watertight professional look' },
    { id: 'colour_change', label: 'Colour change', promptFragment: 'update roof colour to a modern, uniform finish' },
    { id: 'full_roof_makeover', label: 'Full roof makeover', promptFragment: 'show a complete roof makeover with updated materials and colour' },
    CUSTOM_CHANGE_OPTION,
  ],
  landscaping: [
    { id: 'lawn_replacement', label: 'Lawn replacement', promptFragment: 'replace tired lawn with fresh, healthy turf or lawn finish' },
    { id: 'garden_makeover', label: 'Garden makeover', promptFragment: 'transform the garden beds and planting for a polished landscape result' },
    { id: 'paving', label: 'Paving', promptFragment: 'install or refresh paving with level, professional hardscape finishes' },
    { id: 'decking', label: 'Decking', promptFragment: 'build or refresh outdoor decking with clean lines and quality materials' },
    { id: 'fencing', label: 'Fencing', promptFragment: 'install or replace fencing with straight, professional construction' },
    { id: 'outdoor_lighting', label: 'Outdoor lighting', promptFragment: 'add outdoor lighting for ambience and safety with tidy installation' },
    { id: 'full_landscape_makeover', label: 'Full landscape makeover', promptFragment: 'complete a full landscape makeover while preserving property layout' },
    CUSTOM_CHANGE_OPTION,
  ],
  building: [
    ...LEGACY_BUILDER_CHANGE_OPTIONS.filter((o) => o.id !== 'full_renovation'),
    { id: 'bathroom', label: 'Bathroom', promptFragment: 'renovate the bathroom with updated fixtures and finishes while preserving layout' },
    { id: 'kitchen', label: 'Kitchen', promptFragment: 'renovate the kitchen with updated cabinetry, benchtops, and fixtures' },
    { id: 'full_renovation', label: 'Full Renovation', promptFragment: 'complete a full room renovation while preserving the room identity' },
    CUSTOM_CHANGE_OPTION,
  ],
  general: [
    { id: 'paint_walls', label: 'Paint / Walls', promptFragment: 'refresh wall surfaces with an updated professional finish' },
    { id: 'flooring', label: 'Flooring', promptFragment: 'replace or refresh flooring with suitable professional materials' },
    { id: 'cabinets_fixtures', label: 'Cabinets / Fixtures', promptFragment: 'update cabinets and fixtures with a cleaner professional finish' },
    { id: 'lighting', label: 'Lighting', promptFragment: 'improve lighting fixtures and overall lighting quality' },
    { id: 'equipment_replacement', label: 'Equipment replacement', promptFragment: 'replace aged equipment with modern units and tidy installation' },
    { id: 'clean_install_finish', label: 'Clean installation finish', promptFragment: 'show a spotless, professional trade installation finish' },
    { id: 'full_renovation', label: 'Full Renovation', promptFragment: 'complete a substantial upgrade while preserving the scene identity' },
    CUSTOM_CHANGE_OPTION,
  ],
}

const TRADE_SCENE_CONTEXT: Record<RenderTradeId, string> = {
  plumbing: 'Edit this plumbing or wet-area job photo in place. Keep the same room layout, camera angle, and perspective.',
  hvac: 'Edit this HVAC installation photo in place. Keep equipment locations, room layout, and camera angle consistent.',
  electrical: 'Edit this electrical job site photo in place. Keep the same room layout, camera angle, and perspective.',
  painting: 'Edit this interior or exterior painting job photo in place. Keep architectural structure and camera angle.',
  carpentry: 'Edit this carpentry or joinery job photo in place. Keep room layout, camera angle, and perspective.',
  roofing: 'Edit this roofing or exterior job photo in place. Keep building form, camera angle, and perspective.',
  landscaping: 'Edit this outdoor landscaping job photo in place. Keep property layout, camera angle, and perspective.',
  building: 'Edit this interior room photo in place. Keep the same room layout, camera angle, perspective, and architectural structure.',
  general: 'Edit this trade job site photo in place. Keep the same scene layout, camera angle, and perspective.',
}

export function isRenderTradeId(value: string): value is RenderTradeId {
  return (RENDER_TRADE_IDS as readonly string[]).includes(value)
}

export function getRenderChangeOptions(tradeId: RenderTradeId): RenderChangeOption[] {
  return TRADE_RENDER_CHANGES[tradeId]
}

export function getRenderChangeOption(tradeId: RenderTradeId, changeId: string): RenderChangeOption | null {
  return getRenderChangeOptions(tradeId).find((o) => o.id === changeId) ?? null
}

/** Label lookup across all trades + legacy builder keys. */
export function getRenderChangeLabel(changeId: string): string {
  for (const tradeId of RENDER_TRADE_IDS) {
    const match = TRADE_RENDER_CHANGES[tradeId].find((o) => o.id === changeId)
    if (match) return match.label
  }
  const legacy = LEGACY_BUILDER_CHANGE_OPTIONS.find((o) => o.id === changeId)
  return legacy?.label ?? changeId.replace(/_/g, ' ')
}

export function canonicalToRenderTrade(canonical: CanonicalTradeId): RenderTradeId {
  switch (canonical) {
    case 'plumber':
    case 'hot_water_system':
    case 'drain_sewer_specialist':
      return 'plumbing'
    case 'air_conditioning_hvac':
    case 'heating_cooling_technician':
      return 'hvac'
    case 'electrician':
    case 'solar_installer':
      return 'electrical'
    case 'painter':
      return 'painting'
    case 'carpenter':
    case 'tiler':
    case 'flooring_installer':
      return 'carpentry'
    case 'roofer':
    case 'gutter_installation_cleaning':
      return 'roofing'
    case 'landscaper':
    case 'gardener_lawn_care':
    case 'fencing_contractor':
    case 'deck_patio_builder':
    case 'arborist_tree_removal':
      return 'landscaping'
    case 'builder_general_contractor':
    case 'bricklayer_mason':
    case 'concreter':
    case 'glazier_glass_repair':
    case 'handyman':
    case 'pool_builder_maintenance':
    case 'garage_door':
    case 'locksmith':
      return 'building'
    default:
      return 'general'
  }
}

/** Ordered text hints - plumbing before HVAC when both appear in a dual-trade business name. */
const RENDER_TRADE_TEXT_HINTS: { id: RenderTradeId; pattern: RegExp }[] = [
  { id: 'plumbing', pattern: /\b(plumb(er|ing)|hot water|tapware|gas fitting)\b/i },
  { id: 'electrical', pattern: /\b(electric(ian|al)|switchboard|ev charger|wiring)\b/i },
  { id: 'hvac', pattern: /\b(hvac|air conditioning|aircon|split system|ducted air|heating and cooling)\b/i },
  { id: 'painting', pattern: /\b(painter|painting|repaint)\b/i },
  { id: 'roofing', pattern: /\b(roofer|roofing|roof repair|gutter)\b/i },
  { id: 'landscaping', pattern: /\b(landscap|gardener|lawn care|fencing)\b/i },
  { id: 'carpentry', pattern: /\b(carpenter|carpentry|joinery|cabinet maker)\b/i },
  { id: 'building', pattern: /\b(builder|renovation builder|construction company|general contractor)\b/i },
]

function inferRenderTradeFromText(text: string): RenderTradeId | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  for (const hint of RENDER_TRADE_TEXT_HINTS) {
    if (hint.pattern.test(trimmed)) return hint.id
  }
  return null
}

export function resolveRenderTradeFromBusiness(input: {
  ai_agent_services?: string | null
  name?: string | null
}): RenderTradeId {
  const fromServices = inferRenderTradeFromText(input.ai_agent_services ?? '')
  if (fromServices) return fromServices

  const fromName = inferRenderTradeFromText(input.name ?? '')
  if (fromName) return fromName

  const canonical = inferCanonicalTrade(input)
  if (canonical) return canonicalToRenderTrade(canonical)

  return 'general'
}

export interface ParsedRenderChanges {
  changeIds: string[]
  customDescription?: string
}

export function parseRenderChanges(
  values: unknown,
  tradeId: RenderTradeId,
): ParsedRenderChanges | null {
  if (!Array.isArray(values) || values.length === 0) return null

  const allowed = new Set(getRenderChangeOptions(tradeId).map((o) => o.id))
  // Legacy builder keys remain valid for API backward compatibility
  for (const legacy of LEGACY_BUILDER_CHANGE_OPTIONS) allowed.add(legacy.id)

  const changeIds: string[] = []
  for (const value of values) {
    if (typeof value !== 'string' || !allowed.has(value)) return null
    if (!changeIds.includes(value)) changeIds.push(value)
  }

  if (changeIds.length === 0) return null
  return { changeIds }
}

export function getTradeSceneContext(tradeId: RenderTradeId): string {
  return TRADE_SCENE_CONTEXT[tradeId]
}

export function buildRenderChangePromptFragments(
  tradeId: RenderTradeId,
  changeIds: string[],
  customDescription?: string | null,
): string[] {
  const fragments: string[] = []

  for (const changeId of changeIds) {
    if (changeId === CUSTOM_RENDER_CHANGE_ID) continue
    const option =
      getRenderChangeOption(tradeId, changeId) ??
      LEGACY_BUILDER_CHANGE_OPTIONS.find((o) => o.id === changeId)
    if (option?.promptFragment) fragments.push(option.promptFragment)
  }

  if (changeIds.includes(CUSTOM_RENDER_CHANGE_ID) && customDescription?.trim()) {
    fragments.push(customDescription.trim())
  }

  return fragments
}
