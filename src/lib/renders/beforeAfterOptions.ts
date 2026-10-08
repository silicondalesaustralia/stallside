export const BEFORE_AFTER_CHANGES = [
  'paint_walls',
  'flooring',
  'cabinets_fixtures',
  'lighting',
  'full_renovation',
] as const

export type BeforeAfterChange = (typeof BEFORE_AFTER_CHANGES)[number]

export const BEFORE_AFTER_STYLES = [
  'modern',
  'farmhouse',
  'minimalist',
  'luxury',
  'industrial',
] as const

export type BeforeAfterStyle = (typeof BEFORE_AFTER_STYLES)[number]

const CHANGE_SET = new Set<string>(BEFORE_AFTER_CHANGES)
const STYLE_SET = new Set<string>(BEFORE_AFTER_STYLES)

export function isBeforeAfterChange(value: string): value is BeforeAfterChange {
  return CHANGE_SET.has(value)
}

export function isBeforeAfterStyle(value: string): value is BeforeAfterStyle {
  return STYLE_SET.has(value)
}

export function parseBeforeAfterChanges(values: unknown): BeforeAfterChange[] | null {
  if (!Array.isArray(values) || values.length === 0) return null
  const parsed: BeforeAfterChange[] = []
  for (const value of values) {
    if (typeof value !== 'string' || !isBeforeAfterChange(value)) return null
    if (!parsed.includes(value)) parsed.push(value)
  }
  return parsed.length > 0 ? parsed : null
}

export const BEFORE_AFTER_CHANGE_LABELS: Record<BeforeAfterChange, string> = {
  paint_walls:        'Paint / Walls',
  flooring:           'Flooring',
  cabinets_fixtures:  'Cabinets / Fixtures',
  lighting:           'Lighting',
  full_renovation:    'Full Renovation',
}

export const BEFORE_AFTER_STYLE_LABELS: Record<BeforeAfterStyle, string> = {
  modern:      'Modern',
  farmhouse:   'Farmhouse',
  minimalist:  'Minimalist',
  luxury:      'Luxury',
  industrial:  'Industrial',
}
